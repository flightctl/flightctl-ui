import * as React from 'react';
import { EnrollmentRequestApproval } from '@types';
import { Alert, Modal } from '@patternfly/react-core';
import { Formik } from 'formik';
import { useFetch } from '@app/hooks/useFetch';
import { getErrorMessage } from '@app/utils/error';
import DeviceEnrollmentForm, { DeviceEnrollmentFormProps, DeviceEnrollmentFormValues } from './DeviceEnrollmentForm';
import { getApprovalStatus } from '@app/utils/status/enrollmentRequest';

type DeviceEnrollmentModalProps = Omit<DeviceEnrollmentFormProps, 'error'>;

const DeviceEnrollmentModal: React.FC<DeviceEnrollmentModalProps> = ({ enrollmentRequest, onClose }) => {
  const { post } = useFetch();
  const [error, setError] = React.useState<string>();
  return (
    <Formik<DeviceEnrollmentFormValues>
      initialValues={{
        labels: [],
        region: '',
      }}
      onSubmit={async ({ region, labels }) => {
        setError(undefined);
        try {
          await post<EnrollmentRequestApproval>(`enrollmentrequests/${enrollmentRequest.metadata.name}/approval`, {
            approved: true,
            region,
            labels: labels.reduce((acc, { key, value }) => {
              acc[key] = value;
              return acc;
            }, {}),
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
