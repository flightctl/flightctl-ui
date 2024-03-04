import * as React from 'react';
import { EnrollmentRequestApproval } from '@types';
import { Alert, Modal } from '@patternfly/react-core';
import { Formik } from 'formik';
import { useFetch } from '@app/hooks/useFetch';
import { getErrorMessage } from '@app/utils/error';
import DeviceEnrollmentForm, { DeviceEnrollmentFormProps, DeviceEnrollmentFormValues } from './DeviceEnrollmentForm';
import { getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import { useAuth } from 'react-oidc-context';

type DeviceEnrollmentModalProps = Omit<DeviceEnrollmentFormProps, 'error'>;

const DeviceEnrollmentModal: React.FC<DeviceEnrollmentModalProps> = ({ enrollmentRequest, onClose }) => {
  const { post } = useFetch();
  const [error, setError] = React.useState<string>();
  const auth = useAuth();
  return (
    <Formik<DeviceEnrollmentFormValues>
      initialValues={{
        labels: [],
        region: '',
        displayName: '',
      }}
      onSubmit={async ({ region, labels, displayName }) => {
        setError(undefined);
        const deviceLabels: EnrollmentRequestApproval['labels'] = labels.reduce((acc, { key, value }) => {
          acc[key] = value;
          return acc;
        }, {});
        deviceLabels.displayName = displayName;
        try {
          await post<EnrollmentRequestApproval>(`enrollmentrequests/${enrollmentRequest.metadata.name}/approval`, {
            approved: true,
            region,
            labels: deviceLabels,
            approvedBy: auth?.user?.profile.preferred_username,
          });
          onClose(true);
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
    >
      {({ isSubmitting }) => (
        <Modal title="Device enrollment request" isOpen onClose={() => !isSubmitting && onClose()} variant="small">
          {getApprovalStatus(enrollmentRequest) !== 'Approved' ? (
            <DeviceEnrollmentForm enrollmentRequest={enrollmentRequest} onClose={onClose} error={error} />
          ) : (
            <Alert isInline variant="info" title="Enrollment request is already approved." />
          )}
        </Modal>
      )}
    </Formik>
  );
};

export default DeviceEnrollmentModal;
