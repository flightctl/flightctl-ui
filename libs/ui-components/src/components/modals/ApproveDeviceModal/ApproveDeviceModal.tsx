import * as React from 'react';
import { DeviceSpec, EnrollmentRequestApproval } from '@flightctl/types';
import { Alert, Modal } from '@patternfly/react-core';
import { Formik } from 'formik';

import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import ApproveDeviceForm, { ApproveDeviceFormProps, ApproveDeviceFormValues } from './ApproveDeviceForm';
import {
  EnrollmentRequestStatus as EnrollmentRequestStatusType,
  getApprovalStatus,
} from '../../../utils/status/enrollmentRequest';
import { useTranslation } from '../../../hooks/useTranslation';
import { deviceApprovalValidationSchema } from '../../form/validations';

import { fromAPILabel, toAPILabel } from '../../../utils/labels';
import { useAppContext } from '../../../hooks/useAppContext';

type DeviceEnrollmentModalProps = Omit<ApproveDeviceFormProps, 'error'>;

const DeviceEnrollmentModal: React.FC<DeviceEnrollmentModalProps> = ({ enrollmentRequest, onClose }) => {
  const { t } = useTranslation();
  const { post, patch } = useFetch();
  const [error, setError] = React.useState<string>();
  const { user } = useAppContext();
  return (
    <Formik<ApproveDeviceFormValues>
      initialValues={{
        labels: fromAPILabel(enrollmentRequest.spec.labels || {}, { isDefault: true }),
        deviceAlias: '',
      }}
      validationSchema={deviceApprovalValidationSchema(t, { isSingleDevice: true })}
      onSubmit={async ({ labels, deviceAlias }) => {
        setError(undefined);
        try {
          await post<EnrollmentRequestApproval>(`enrollmentrequests/${enrollmentRequest.metadata.name}/approval`, {
            approved: true,
            labels: toAPILabel(labels),
            approvedBy: user,
          });
          // Workaround until EDM-607 allows us to specify the alias in the approval request
          await patch<DeviceSpec>(`devices/${enrollmentRequest.metadata.name}`, [
            {
              op: 'add',
              path: '/metadata/alias',
              value: deviceAlias,
            },
          ]);
          onClose(true);
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
    >
      {({ isSubmitting }) => (
        <Modal title={t('Approve pending device')} isOpen onClose={() => !isSubmitting && onClose()} variant="small">
          {getApprovalStatus(enrollmentRequest) !== EnrollmentRequestStatusType.Approved ? (
            <ApproveDeviceForm enrollmentRequest={enrollmentRequest} onClose={onClose} error={error} />
          ) : (
            <Alert isInline variant="info" title={t('Enrollment request is already approved.')} />
          )}
        </Modal>
      )}
    </Formik>
  );
};

export default DeviceEnrollmentModal;
