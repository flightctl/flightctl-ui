import * as React from 'react';
import { EnrollmentRequestApproval } from '@flightctl/types';
import { Alert, Modal } from '@patternfly/react-core';
import { Formik } from 'formik';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import DeviceEnrollmentForm, { DeviceEnrollmentFormProps, DeviceEnrollmentFormValues } from './DeviceEnrollmentForm';
import { ApprovalStatus, getApprovalStatus } from '../../../utils/status/enrollmentRequest';
import { useAuth } from 'react-oidc-context';
import { useTranslation } from '../../../hooks/useTranslation';
import { toAPILabel } from '../../../utils/labels';

type DeviceEnrollmentModalProps = Omit<DeviceEnrollmentFormProps, 'error'>;

const DeviceEnrollmentModal: React.FC<DeviceEnrollmentModalProps> = ({ enrollmentRequest, onClose }) => {
  const { t } = useTranslation();
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
        const deviceLabels: EnrollmentRequestApproval['labels'] = toAPILabel(labels);
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
        <Modal title={t('Device enrollment request')} isOpen onClose={() => !isSubmitting && onClose()} variant="small">
          {getApprovalStatus(enrollmentRequest) !== ApprovalStatus.Approved ? (
            <DeviceEnrollmentForm enrollmentRequest={enrollmentRequest} onClose={onClose} error={error} />
          ) : (
            <Alert isInline variant="info" title={t('Enrollment request is already approved.')} />
          )}
        </Modal>
      )}
    </Formik>
  );
};

export default DeviceEnrollmentModal;
