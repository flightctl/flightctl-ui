import { useAuth } from '@app/hooks/useAuth';
import { useFetch } from '@app/hooks/useFetch';
import { Device, EnrollmentRequest, EnrollmentRequestApproval } from '@types';
import * as React from 'react';
import { getErrorMessage } from '@app/utils/error';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { ApprovalStatus, getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import { Formik } from 'formik';
import { getFingerprintDisplay } from '@app/utils/devices';

import './MassApproveDeviceModal.css';
import { isEnrollmentRequest } from '@app/types/extraTypes';
import LabelsField from '@app/components/form/LabelsField';

const templateToName = (index: number, nameTemplate: string) => nameTemplate.replace(/{{n+}}/g, `${index + 1}`);

type DeviceEnrollmentFormValues = {
  labels: { key: string; value: string }[];
  region: string;
  displayName: string;
};

type MassApproveDeviceModalProps = {
  onClose: VoidFunction;
  resources: Array<Device | EnrollmentRequest>;
  onApproveSuccess: VoidFunction;
};

const MassApproveDeviceModal: React.FC<MassApproveDeviceModalProps> = ({ onClose, onApproveSuccess, resources }) => {
  const [progress, setProgress] = React.useState(0);
  const [totalProgress, setTotalProgress] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>();
  const { post } = useFetch();
  const auth = useAuth();

  const enrollmentRequests = resources.filter(
    (r) => isEnrollmentRequest(r) && getApprovalStatus(r) !== ApprovalStatus.Approved,
  ) as EnrollmentRequest[];

  const approveResources = async (values: DeviceEnrollmentFormValues) => {
    setProgress(0);
    setErrors(undefined);
    const promises = enrollmentRequests.map(async (r, index) => {
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
        approvedBy: auth?.user?.profile.preferred_username,
      });
      setProgress((p) => p + 1);
    });
    setTotalProgress(promises.length);
    const results = await Promise.allSettled(promises);
    const rejectedResults = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

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
      onSubmit={approveResources}
    >
      {({ isSubmitting, values, setFieldValue, submitForm }) => (
        <Modal
          title="Approve pending devices"
          isOpen
          onClose={onClose}
          showClose={!isSubmitting}
          variant="medium"
          actions={[
            <Button
              key="delete"
              variant="primary"
              onClick={submitForm}
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              Approve
            </Button>,
            <Button key="cancel" variant="link" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>,
          ]}
        >
          <Stack hasGutter>
            <StackItem>
              Make sure you recognise and expect the following devices before approving them. Are you sure you want to
              approve the listed devices?
            </StackItem>
            {enrollmentRequests.length !== resources.length && (
              <StackItem>
                <Alert
                  variant="info"
                  isInline
                  title="Some of the selected devices were already approved and will be excluded."
                />
              </StackItem>
            )}
            <StackItem className="fctl-mass-approve__table">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Fingerprint</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {resources.map((resource) => {
                    return (
                      <Tr key={resource.metadata.name}>
                        <Td dataLabel="Fingerprint">{getFingerprintDisplay(resource)}</Td>
                        <Td dataLabel="Status">
                          {isEnrollmentRequest(resource) ? getApprovalStatus(resource) : 'Already approved'}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </StackItem>
            <StackItem>
              <Form>
                <FormGroup label="Labels">
                  <LabelsField labels={values.labels} setLabels={(labels) => setFieldValue('labels', labels)} />
                </FormGroup>
                <FormGroup label="Region" isRequired>
                  <TextInput
                    aria-label="Region"
                    value={values.region}
                    onChange={(_, value) => setFieldValue('region', value)}
                  />
                </FormGroup>
                <FormGroup label="Name" isRequired>
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        <div>Name devices using the custom template.</div>
                        <div>
                          <>
                            <strong>{`{{n}}`}</strong> to add a number.
                          </>
                        </div>
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                  <TextInput
                    aria-label="Name"
                    value={values.displayName}
                    onChange={(_, value) => setFieldValue('displayName', value)}
                    placeholder="device-{{n}}"
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
                  title="Approving..."
                  measureLocation={ProgressMeasureLocation.top}
                  label={`${progress} of ${totalProgress}`}
                  valueText={`${progress} of ${totalProgress}`}
                />
              </StackItem>
            )}
            {errors?.length && (
              <StackItem>
                <Alert isInline variant="danger" title="An error occured">
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
