import * as React from 'react';
import { EnrollmentRequest } from '@types';
import { Alert, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import LabelsField from '@app/components/form/LabelsField';
import FlightCtlActionGroup from '@app/components/form/FlightCtlActionGroup';
import { FlightCtlLabel } from '@app/types/extraTypes';
import { useTranslation } from 'react-i18next';

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
  const { values, setFieldValue, submitForm, isSubmitting } = useFormikContext<DeviceEnrollmentFormValues>();
  return (
    <Form>
      {enrollmentRequest && (
        <FormGroup label={t('Fingerprint')}>
          <TextInput aria-label="Fingerprint" isDisabled value={enrollmentRequest.metadata.name} />
        </FormGroup>
      )}
      <FormGroup label={t('Labels')}>
        <LabelsField labels={values.labels} setLabels={(labels) => setFieldValue('labels', labels)} />
      </FormGroup>
      <FormGroup label={t('Region')} isRequired>
        <TextInput aria-label="Region" value={values.region} onChange={(_, value) => setFieldValue('region', value)} />
      </FormGroup>
      <FormGroup label={t('Name')} isRequired>
        <TextInput
          aria-label={t('Name')}
          value={values.displayName}
          onChange={(_, value) => setFieldValue('displayName', value)}
        />
      </FormGroup>
      {children}
      {error && <Alert isInline title={error} variant="danger" />}
      <FlightCtlActionGroup>
        <Button key="confirm" variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
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
