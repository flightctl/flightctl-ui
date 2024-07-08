import * as React from 'react';
import { EnrollmentRequest } from '@flightctl/types';
import { Alert, Button, Form, FormGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import RichValidationTextField from '../../form/RichValidationTextField';
import LabelsField from '../../form/LabelsField';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { useTranslation } from '../../../hooks/useTranslation';
import DisplayName from '../../common/DisplayName';
import { getLabelValueValidations } from '../../../components/form/validations';

export type DeviceEnrollmentFormValues = {
  labels: FlightCtlLabel[];
  displayName: string;
};

export type DeviceEnrollmentFormProps = {
  enrollmentRequest: EnrollmentRequest;
  onClose: (refetch?: boolean) => void;
  error?: string;
  children?: React.ReactNode;
};

const DeviceEnrollmentForm: React.FC<DeviceEnrollmentFormProps> = ({ enrollmentRequest, onClose, error, children }) => {
  const { t } = useTranslation();
  const { submitForm, isSubmitting, errors: formErrors } = useFormikContext<DeviceEnrollmentFormValues>();
  const disableSubmit = Object.keys(formErrors).length > 0;
  return (
    <Form onSubmit={(ev) => ev.preventDefault()}>
      {enrollmentRequest && (
        <FormGroup label={t('Fingerprint')} aria-label={t('Fingerprint')}>
          <DisplayName name={enrollmentRequest.metadata.name} variant="full" />
        </FormGroup>
      )}
      <FormGroup label={t('Labels')}>
        <LabelsField name="labels" />
      </FormGroup>
      <RichValidationTextField
        fieldName="displayName"
        aria-label={t('Display name')}
        validations={getLabelValueValidations(t)}
      />
      {children}
      {error && <Alert isInline title={error} variant="danger" />}
      <FlightCtlActionGroup>
        <Button
          key="confirm"
          variant="primary"
          onClick={submitForm}
          isDisabled={disableSubmit || isSubmitting}
          isLoading={isSubmitting}
        >
          {t('Approve')}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </Form>
  );
};

export default DeviceEnrollmentForm;
