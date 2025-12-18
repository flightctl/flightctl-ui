import * as React from 'react';
import { EnrollmentRequestApproval } from '@flightctl/types';
import {
  Alert,
  Modal /* data-codemods */,
  ModalBody /* data-codemods */,
  ModalHeader /* data-codemods */,
} from '@patternfly/react-core';

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

type DeviceEnrollmentModalProps = Omit<ApproveDeviceFormProps, 'error'>;

const DeviceEnrollmentModal: React.FC<DeviceEnrollmentModalProps> = ({ enrollmentRequest, onClose }) => {
  const { t } = useTranslation();
  const { put } = useFetch();
  const [error, setError] = React.useState<string>();
  const labels = enrollmentRequest.spec.labels || {};
  return (
    <Formik<ApproveDeviceFormValues>
      initialValues={{
        labels: fromAPILabel(labels, { isDefault: true }).filter((label) => label.key !== 'alias'),
        deviceAlias: labels.alias || '',
      }}
      validationSchema={deviceApprovalValidationSchema(t, { isSingleDevice: true })}
      onSubmit={async ({ labels, deviceAlias }) => {
        setError(undefined);
        const deviceLabels: EnrollmentRequestApproval['labels'] = toAPILabel(labels);
        if (deviceAlias) {
          deviceLabels.alias = deviceAlias;
        }

        try {
          await put<EnrollmentRequestApproval>(`enrollmentrequests/${enrollmentRequest.metadata.name}/approval`, {
            approved: true,
            labels: deviceLabels,
          });
          onClose(true);
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
    >
      {({ isSubmitting }) => (
        <Modal isOpen onClose={() => !isSubmitting && onClose()} variant="small">
          <ModalHeader title={t('Approve pending device')} />
          <ModalBody>
            {getApprovalStatus(enrollmentRequest) !== EnrollmentRequestStatusType.Approved ? (
              <ApproveDeviceForm enrollmentRequest={enrollmentRequest} onClose={onClose} error={error} />
            ) : (
              <Alert isInline variant="info" title={t('Enrollment request is already approved.')} />
            )}
          </ModalBody>
        </Modal>
      )}
    </Formik>
  );
};

export default DeviceEnrollmentModal;
