import * as React from 'react';
import { EnrollmentRequest, EnrollmentRequestApproval } from '@flightctl/types';
import {
	Alert,
	Button,
	FormGroup,
	Progress,
	ProgressMeasureLocation,
	Stack,
	StackItem,
	Modal /* data-codemods */,
	ModalBody /* data-codemods */,
	ModalFooter /* data-codemods */,
	ModalHeader /* data-codemods */
} from '@patternfly/react-core';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Formik } from 'formik';

import TextField from '../../../form/TextField';
import LabelsField from '../../../form/LabelsField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { deviceApprovalValidationSchema } from '../../../form/validations';
import ResourceLink from '../../../common/ResourceLink';
import { isPromiseRejected } from '../../../../types/typeUtils';
import { getErrorMessage } from '../../../../utils/error';
import { useAppContext } from '../../../../hooks/useAppContext';
import { useTranslation } from '../../../../hooks/useTranslation';
import { toAPILabel } from '../../../../utils/labels';

import './MassApproveDeviceModal.css';

const templateToName = (index: number, nameTemplate: string) =>
  nameTemplate ? nameTemplate.replace(/{{n+}}/g, `${index + 1}`) : '';

type MassApproveDeviceFormValues = {
  labels: { key: string; value: string }[];
  deviceAlias: string;
};
type MassApproveDeviceModalProps = {
  onClose: VoidFunction;
  pendingEnrollments: Array<EnrollmentRequest>;
  onApproveSuccess: VoidFunction;
};

const MassApproveDeviceModal: React.FC<MassApproveDeviceModalProps> = ({
  onClose,
  onApproveSuccess,
  pendingEnrollments,
}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = React.useState(0);
  const [totalProgress, setTotalProgress] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>();
  const {
    fetch: { put },
  } = useAppContext();

  const approveEnrollments = async (values: MassApproveDeviceFormValues) => {
    setProgress(0);
    setErrors(undefined);
    const promises = pendingEnrollments.map(async (r, index) => {
      const labels = toAPILabel(values.labels);
      const aliasLabel = templateToName(index, values.deviceAlias);
      if (aliasLabel) {
        labels.alias = aliasLabel;
      }

      await put<EnrollmentRequestApproval>(`enrollmentrequests/${r.metadata.name}/approval`, {
        approved: true,
        labels,
      });
      setProgress((p) => p + 1);
    });
    setTotalProgress(promises.length);
    const results = await Promise.allSettled(promises);
    const rejectedResults = results.filter(isPromiseRejected);

    if (rejectedResults.length) {
      setErrors(rejectedResults.map((r) => getErrorMessage(r.reason)));
    } else {
      onApproveSuccess();
    }
  };

  return (
    <Formik<MassApproveDeviceFormValues>
      initialValues={{
        labels: [],
        deviceAlias: '',
      }}
      validationSchema={deviceApprovalValidationSchema(t, { isSingleDevice: false })}
      onSubmit={approveEnrollments}
    >
      {({ isSubmitting, values, submitForm, isValid }) => (
        <Modal isOpen onClose={isSubmitting ? undefined : onClose} variant="medium">
          <ModalHeader title={t('Approve pending devices')} />
          <ModalBody>
            <Stack hasGutter>
              <StackItem>
                {t(
                  'Make sure you recognise and expect the following devices before approving them. Are you sure you want to approve the listed devices?',
                )}
              </StackItem>
              <StackItem className="fctl-mass-approve__table">
                <Table>
                  <Thead>
                    <Tr>
                      <Th width={60}>{t('Name')}</Th>
                      <Th width={40}>{t('Alias')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingEnrollments.map((pendingEr, index) => (
                      <Tr key={pendingEr.metadata.name}>
                        <Td dataLabel={t('Name')}>
                          <ResourceLink id={pendingEr.metadata.name as string} />
                        </Td>
                        <Td dataLabel={t('Alias')}>{templateToName(index, values.deviceAlias)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </StackItem>
              <StackItem>
                <FlightCtlForm>
                  <FormGroup label={t('Labels')}>
                    <LabelsField name="labels" />
                  </FormGroup>
                  <FormGroup label={t('Alias')}>
                    <TextField
                      name="deviceAlias"
                      aria-label={t('Alias')}
                      placeholder="device-{{n}}"
                      helperText={
                        <>
                          {t('Alias devices using a custom template. Add a number using')}
                          <strong> {`{{n}}`}</strong>
                        </>
                      }
                    />
                  </FormGroup>
                </FlightCtlForm>
              </StackItem>
              {isSubmitting && (
                <StackItem>
                  <Progress
                    value={progress}
                    min={0}
                    max={totalProgress}
                    title={t('Approving...')}
                    measureLocation={ProgressMeasureLocation.top}
                    label={t('{{progress}} of {{totalProgress}}', { progress, totalProgress })}
                    valueText={t('{{progress}} of {{totalProgress}}', { progress, totalProgress })}
                  />
                </StackItem>
              )}
              {errors?.length && (
                <StackItem>
                  <Alert isInline variant="danger" title={t('An error occurred')}>
                    <Stack hasGutter>
                      {errors.map((e, index) => (
                        <StackItem key={index}>{e}</StackItem>
                      ))}
                    </Stack>
                  </Alert>
                </StackItem>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              key="approve"
              variant="primary"
              onClick={submitForm}
              isLoading={isSubmitting}
              isDisabled={isSubmitting || !isValid}
            >
              {t('Approve')}
            </Button>
            <Button key="cancel" variant="link" onClick={onClose} isDisabled={isSubmitting}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Formik>
  );
};

export default MassApproveDeviceModal;
