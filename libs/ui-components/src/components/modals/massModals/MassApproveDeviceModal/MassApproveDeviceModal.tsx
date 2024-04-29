import { Device, EnrollmentRequest, EnrollmentRequestApproval } from '@flightctl/types';
import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Modal,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Formik } from 'formik';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

import TextField from '../../../form/TextField';
import LabelsField from '../../../form/LabelsField';
import { isPromiseRejected } from '../../../../types/typeUtils';
import { isEnrollmentRequest } from '../../../../types/extraTypes';
import { ApprovalStatus, getApprovalStatus } from '../../../../utils/status/enrollmentRequest';
import { getFingerprintDisplay } from '../../../../utils/devices';
import { getErrorMessage } from '../../../../utils/error';
import { useAppContext } from '../../../../hooks/useAppContext';
import { useTranslation } from '../../../../hooks/useTranslation';
import EnrollmentRequestStatus from '../../../EnrollmentRequest/EnrollmentRequestStatus';
import { ApprovedStatus } from '../../../Device/DeviceDetails/DeviceStatus';

import './MassApproveDeviceModal.css';

const templateToName = (index: number, nameTemplate: string) =>
  nameTemplate ? nameTemplate.replace(/{{n+}}/g, `${index + 1}`) : '-';

const isPendingEnrollmentRequest = (r: Device | EnrollmentRequest): r is EnrollmentRequest => {
  return isEnrollmentRequest(r) && getApprovalStatus(r) !== ApprovalStatus.Approved;
};

type DeviceEnrollmentFormValues = {
  labels: { key: string; value: string }[];
  region: string;
  displayName: string;
};

const validationSchema = (t: TFunction) =>
  Yup.object({
    displayName: Yup.string()
      .matches(
        /{{n}}/,
        t('Device display names must be unique. Add a number to the template to generate unique names.'),
      )
      .required(t('Display name is required.')),
    region: Yup.string().required(t('Region is required.')),
  });

type MassApproveDeviceModalProps = {
  onClose: VoidFunction;
  resources: Array<Device | EnrollmentRequest>;
  onApproveSuccess: VoidFunction;
};

const MassApproveDeviceModal: React.FC<MassApproveDeviceModalProps> = ({ onClose, onApproveSuccess, resources }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = React.useState(0);
  const [totalProgress, setTotalProgress] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>();
  const {
    user,
    fetch: { post },
  } = useAppContext();

  const pendingEnrollments = resources.filter(isPendingEnrollmentRequest);

  const approveResources = async (values: DeviceEnrollmentFormValues) => {
    setProgress(0);
    setErrors(undefined);
    const promises = pendingEnrollments.map(async (r, index) => {
      const labels = values.labels.reduce(
        (acc, { key, value }) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );
      labels.displayName = templateToName(index, values.displayName);
      await post<EnrollmentRequestApproval>(`enrollmentrequests/${r.metadata.name}/approval`, {
        approved: true,
        region: values.region,
        labels,
        approvedBy: user,
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
    <Formik<DeviceEnrollmentFormValues>
      initialValues={{
        labels: [],
        region: '',
        displayName: '',
      }}
      validationSchema={validationSchema(t)}
      onSubmit={approveResources}
    >
      {({ isSubmitting, values, setFieldValue, submitForm, isValid, dirty }) => (
        <Modal
          title={t('Approve pending devices')}
          isOpen
          onClose={onClose}
          showClose={!isSubmitting}
          variant="medium"
          actions={[
            <Button
              key="approve"
              variant="primary"
              onClick={submitForm}
              isLoading={isSubmitting}
              isDisabled={isSubmitting || !isValid || !dirty}
            >
              {t('Approve')}
            </Button>,
            <Button key="cancel" variant="link" onClick={onClose} isDisabled={isSubmitting}>
              {t('Cancel')}
            </Button>,
          ]}
        >
          <Stack hasGutter>
            <StackItem>
              {t(
                'Make sure you recognise and expect the following devices before approving them. Are you sure you want to approve the listed devices?',
              )}
            </StackItem>
            {pendingEnrollments.length !== resources.length && (
              <StackItem>
                <Alert
                  variant="info"
                  isInline
                  title={t('Some of the selected devices were already approved and will be excluded.')}
                />
              </StackItem>
            )}
            <StackItem className="fctl-mass-approve__table">
              <Table>
                <Thead>
                  <Tr>
                    <Th width={25}>{t('Fingerprint')}</Th>
                    <Th width={25}>{t('Status')}</Th>
                    <Th width={50}>{t('Display name')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {resources.map((resource, index) => {
                    const isPendingEr = isPendingEnrollmentRequest(resource);
                    return (
                      <Tr key={resource.metadata.name}>
                        <Td dataLabel={t('Fingerprint')}>{getFingerprintDisplay(resource)}</Td>
                        <Td dataLabel={t('Status')}>
                          {isPendingEr ? <EnrollmentRequestStatus er={resource} /> : <ApprovedStatus />}
                        </Td>
                        <Td dataLabel={t('Display name')}>
                          {isPendingEr ? templateToName(index, values.displayName) : '-'}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </StackItem>
            <StackItem>
              <Form>
                <FormGroup label={t('Labels')}>
                  <LabelsField labels={values.labels} setLabels={(labels) => setFieldValue('labels', labels)} />
                </FormGroup>
                <FormGroup label={t('Region')} isRequired>
                  <TextField name="region" aria-label={t('Region')} />
                </FormGroup>

                <FormGroup label={t('Display name')} isRequired>
                  <TextField
                    name="displayName"
                    aria-label={t('Display name')}
                    placeholder="device-{{n}}"
                    helperText={
                      <>
                        {t('Name devices using a custom template. Add a number using')}
                        <strong> {`{{n}}`}</strong>
                      </>
                    }
                  />
                </FormGroup>
              </Form>
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
        </Modal>
      )}
    </Formik>
  );
};

export default MassApproveDeviceModal;
