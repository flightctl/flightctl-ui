import * as React from 'react';
import { EnrollmentRequestApproval } from '@flightctl/types';
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

import { toAPILabel } from '../../../utils/labels';
import { useAppContext } from '../../../hooks/useAppContext';

type DeviceEnrollmentModalProps = Omit<ApproveDeviceFormProps, 'error'>;

const DeviceEnrollmentModal: React.FC<DeviceEnrollmentModalProps> = ({ enrollmentRequest, onClose }) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [error, setError] = React.useState<string>();
  const { user } = useAppContext();
  return (
    <Formik<ApproveDeviceFormValues>
      initialValues={{
        labels: [],
        deviceAlias: '',
      }}
      validationSchema={deviceApprovalValidationSchema(t, { isSingleDevice: true })}
      onSubmit={async ({ labels, deviceAlias }) => {
        setError(undefined);
        const deviceLabels: EnrollmentRequestApproval['labels'] = toAPILabel(labels);
        if (deviceAlias) {
          deviceLabels.alias = deviceAlias;
        }

        try {
          await post<EnrollmentRequestApproval>(`enrollmentrequests/${enrollmentRequest.metadata.name}/approval`, {
            approved: true,
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
