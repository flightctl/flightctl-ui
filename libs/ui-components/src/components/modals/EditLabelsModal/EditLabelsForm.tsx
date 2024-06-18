import * as React from 'react';
import { Formik, FormikProps } from 'formik';
import { Alert, Form, FormGroup } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import debounce from 'lodash/debounce';

import { Device } from '@flightctl/types';
import LabelsField from '../../form/LabelsField';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { fromAPILabel } from '../../../utils/labels';
import { validLabelsSchema } from '../../form/validations';
import { getUpdatedDevice } from '../../../utils/devices';
import { getErrorMessage } from '../../../utils/error';

type EditLabelsFormValues = {
  labels: FlightCtlLabel[];
};

type EditLabelsFormContentProps = {
  isSubmitting: FormikProps<EditLabelsFormValues>['isSubmitting'];
  submitForm: (values: EditLabelsFormValues) => Promise<string>;
};

const getValidationSchema = (t: TFunction) => {
  return Yup.object<EditLabelsFormValues>({
    labels: validLabelsSchema(t),
  });
};

const EditLabelsFormContent = ({ isSubmitting, submitForm }: EditLabelsFormContentProps) => {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = React.useState<string>();

  const onChangedLabels = async (newLabels: FlightCtlLabel[], hasErrors: boolean) => {
    setSubmitError(undefined);
    if (!hasErrors) {
      const error = await submitForm({ labels: newLabels });
      setSubmitError(error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = React.useCallback(debounce(onChangedLabels, 2000), []);

  return (
    <Form onSubmit={(ev) => ev.preventDefault()}>
      <FormGroup label={t('Device labels')}>
        <LabelsField
          name="labels"
          addButtonText={isSubmitting ? t('Saving...') : undefined}
          isEditable={!isSubmitting}
          onChangeCallback={debouncedSubmit}
        />
      </FormGroup>
      {submitError && <Alert isInline title={submitError} variant="danger" />}
    </Form>
  );
};

type EditLabelsFormProps = {
  device: Device;
  onDeviceUpdate: () => void;
};

const EditLabelsForm = ({ device, onDeviceUpdate }: EditLabelsFormProps) => {
  const { t } = useTranslation();
  const { put } = useFetch();

  return (
    <Formik<EditLabelsFormValues>
      initialValues={{
        labels: fromAPILabel(device.metadata.labels || {}),
      }}
      onSubmit={async (values: EditLabelsFormValues) => {
        try {
          const updatedData = getUpdatedDevice(device, values.labels);
          await put(`devices/${device.metadata.name}`, updatedData);
          onDeviceUpdate();
          return null;
        } catch (e) {
          return getErrorMessage(e);
        }
      }}
      validationSchema={getValidationSchema(t)}
    >
      {({ isSubmitting, submitForm }) => <EditLabelsFormContent isSubmitting={isSubmitting} submitForm={submitForm} />}
    </Formik>
  );
};

export default EditLabelsForm;
