import { Device, EnrollmentRequest, EnrollmentRequestApproval } from '@flightctl/types';
import * as React from 'react';
import {
  Alert,
  Button,
  ExpandableSection,
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
import { toAPILabel } from '../../../../utils/labels';

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
      .matches(/{{n}}/, t('Device names must be unique. Add a number to the template to generate unique names.'))
      .required(t('Name is required.')),
    region: Yup.string().required(t('Region is required.')),
  });

type MassApproveDeviceModalProps = {
  onClose: VoidFunction;
  resources: Array<Device | EnrollmentRequest>;
  onApproveSuccess: VoidFunction;
};

const ApprovedDevicesTable = ({ devices }: { devices: Array<EnrollmentRequest | Device> }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <Thead>
        <Tr>
          <Th width={25}>{t('Fingerprint')}</Th>
          <Th width={50}>{t('Name')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {devices.map((device) => (
          <Tr key={device.metadata.name}>
            <Td dataLabel={t('Fingerprint')}>{getFingerprintDisplay(device)}</Td>
            <Td dataLabel={t('Name')}>{device.metadata.labels?.displayName || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
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
  const resourcesToSkip = resources.filter((r) => !isPendingEnrollmentRequest(r));

  if (pendingEnrollments.length === 0) {
    return (
      <Modal
        title={t('Approve pending devices')}
        isOpen
        onClose={onClose}
        showClose
        variant="medium"
        actions={[
          <Button key="close" variant="primary" onClick={onClose}>
            {t('Close')}
          </Button>,
        ]}
      >
        <Stack hasGutter>
          <StackItem>
            <Alert
              variant="info"
              isInline
              title={t('All the devices you selected are already approved and cannot be approved again.')}
            />
          </StackItem>
          <StackItem>
            <ApprovedDevicesTable devices={resourcesToSkip} />
          </StackItem>
        </Stack>
      </Modal>
    );
  }

  const approveResources = async (values: DeviceEnrollmentFormValues) => {
    setProgress(0);
    setErrors(undefined);
    const promises = pendingEnrollments.map(async (r, index) => {
      const labels = toAPILabel(values.labels);
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
            <StackItem className="fctl-mass-approve__table">
              <Table>
                <Thead>
                  <Tr>
                    <Th width={25}>{t('Fingerprint')}</Th>
                    <Th width={25}>{t('Status')}</Th>
                    <Th width={50}>{t('Name')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingEnrollments.map((pendingEr, index) => (
                    <Tr key={pendingEr.metadata.name}>
                      <Td dataLabel={t('Fingerprint')}>{getFingerprintDisplay(pendingEr)}</Td>
                      <Td dataLabel={t('Status')}>
                        <EnrollmentRequestStatus er={pendingEr} />
                      </Td>
                      <Td dataLabel={t('Name')}>{templateToName(index, values.displayName)}</Td>
                    </Tr>
                  ))}
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

                <FormGroup label={t('Name')} isRequired>
                  <TextField
                    name="displayName"
                    aria-label={t('Name')}
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
            {resourcesToSkip.length > 0 && (
              <>
                <StackItem>
                  <Alert
                    variant="info"
                    isInline
                    title={t('Some devices you selected are already approved and will be excluded.')}
                  />
                </StackItem>
                <StackItem>
                  <ExpandableSection toggleText={t('Show already approved devices')}>
                    <ApprovedDevicesTable devices={resourcesToSkip} />
                  </ExpandableSection>
                </StackItem>
              </>
            )}
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
