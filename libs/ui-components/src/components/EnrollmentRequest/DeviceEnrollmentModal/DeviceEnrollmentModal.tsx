import * as React from 'react';
import { EnrollmentRequestApproval } from '@flightctl/types';
import { Alert, Modal } from '@patternfly/react-core';
import { Formik } from 'formik';

import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import DeviceEnrollmentForm, { DeviceEnrollmentFormProps, DeviceEnrollmentFormValues } from './DeviceEnrollmentForm';
import { getApprovalStatus } from '../../../utils/status/enrollmentRequest';
import { EnrollmentRequestStatus as EnrollmentRequestStatusType } from '../../../utils/status/common';
import { useTranslation } from '../../../hooks/useTranslation';
import { deviceApprovalValidationSchema } from '../../form/validations';

import { toAPILabel } from '../../../utils/labels';
import { useAppContext } from '../../../hooks/useAppContext';

type DeviceEnrollmentModalProps = Omit<DeviceEnrollmentFormProps, 'error'>;

const DeviceEnrollmentModal: React.FC<DeviceEnrollmentModalProps> = ({ enrollmentRequest, onClose }) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [error, setError] = React.useState<string>();
  const { user } = useAppContext();
  return (
    <Formik<DeviceEnrollmentFormValues>
      initialValues={{
        labels: [],
        region: '',
        displayName: '',
      }}
      validationSchema={deviceApprovalValidationSchema(t, { isSingleDevice: true })}
      onSubmit={async ({ region, labels, displayName }) => {
        setError(undefined);
        const deviceLabels: EnrollmentRequestApproval['labels'] = toAPILabel(labels);
        deviceLabels.displayName = displayName;
        try {
          await post<EnrollmentRequestApproval>(`enrollmentrequests/${enrollmentRequest.metadata.name}/approval`, {
            approved: true,
            region,
            labels: deviceLabels,
            approvedBy: user,
          });
          onClose(true);
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
    >
      {({ isSubmitting }) => (
        <Modal title={t('Device enrollment request')} isOpen onClose={() => !isSubmitting && onClose()} variant="small">
          {getApprovalStatus(enrollmentRequest) !== EnrollmentRequestStatusType.Approved ? (
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
