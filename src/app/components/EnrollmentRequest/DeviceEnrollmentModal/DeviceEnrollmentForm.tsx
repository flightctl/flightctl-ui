import * as React from 'react';
import { EnrollmentRequest } from '@types';
import { ActionGroup, Alert, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import LabelsField from '@app/components/form/LabelsField';

export type DeviceEnrollmentFormValues = {
  labels: { key: string; value: string }[];
  region: string;
  displayName: string;
};

export type DeviceEnrollmentFormProps = {
  enrollmentRequest: EnrollmentRequest;
  onClose: (refetch?: boolean) => void;
  error?: string;
};

const DeviceEnrollmentForm: React.FC<DeviceEnrollmentFormProps> = ({ enrollmentRequest, onClose, error }) => {
  const { values, setFieldValue, submitForm, isSubmitting } = useFormikContext<DeviceEnrollmentFormValues>();
  return (
    <Form>
      <FormGroup label="Fingerprint">
        <TextInput aria-label="Fingerprint" isDisabled value={enrollmentRequest.metadata.name} />
      </FormGroup>
      <FormGroup label="Labels">
        <LabelsField labels={values.labels} setLabels={(labels) => setFieldValue('labels', labels)} />
      </FormGroup>
      <FormGroup label="Region" isRequired>
        <TextInput aria-label="Region" value={values.region} onChange={(_, value) => setFieldValue('region', value)} />
      </FormGroup>
      <FormGroup label="Name" isRequired>
        <TextInput
          aria-label="Name"
          value={values.displayName}
          onChange={(_, value) => setFieldValue('displayName', value)}
        />
      </FormGroup>
      {error && <Alert isInline title={error} variant="danger" />}
      <ActionGroup>
        <Button key="confirm" variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
          Approve request
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};

export default DeviceEnrollmentForm;
