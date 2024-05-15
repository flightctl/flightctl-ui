import * as React from 'react';
import { EnrollmentRequest } from '@flightctl/types';
import { Alert, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import LabelsField from '../../form/LabelsField';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { useTranslation } from '../../../hooks/useTranslation';
import TextField from '../../form/TextField';

export type DeviceEnrollmentFormValues = {
  labels: FlightCtlLabel[];
  region: string;
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
  const { submitForm, isSubmitting, errors: formErrors, dirty } = useFormikContext<DeviceEnrollmentFormValues>();
  const disableSubmit = !dirty || Object.keys(formErrors).length > 0;
  return (
    <Form onSubmit={(ev) => ev.preventDefault()}>
      {enrollmentRequest && (
        <FormGroup label={t('Fingerprint')}>
          <TextInput aria-label={t('Fingerprint')} isDisabled value={enrollmentRequest.metadata.name} />
        </FormGroup>
      )}
      <FormGroup label={t('Labels')}>
        <LabelsField name="labels" />
      </FormGroup>
      <FormGroup label={t('Region')} isRequired>
        <TextField name="region" aria-label={t('Region')} />
      </FormGroup>
      <FormGroup label={t('Name')} isRequired>
        <TextField name="displayName" aria-label={t('Display name')} />
      </FormGroup>
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
