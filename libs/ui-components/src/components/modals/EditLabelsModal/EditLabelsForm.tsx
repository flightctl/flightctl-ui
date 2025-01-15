import * as React from 'react';
import { Formik, FormikProps } from 'formik';
import { Alert } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import debounce from 'lodash/debounce';

import { Device } from '@flightctl/types';
import LabelsField from '../../form/LabelsField';
import FlightCtlForm from '../../form/FlightCtlForm';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { fromAPILabel } from '../../../utils/labels';
import { validLabelsSchema } from '../../form/validations';
import { getErrorMessage } from '../../../utils/error';
import { getLabelPatches } from '../../../utils/patch';
import LabelsView from '../../common/LabelsView';

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

const delayResponse = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    <FlightCtlForm>
      <LabelsField
        name="labels"
        addButtonText={isSubmitting ? t('Saving...') : undefined}
        isLoading={isSubmitting}
        onChangeCallback={debouncedSubmit}
      />
      {submitError && <Alert isInline title={submitError} variant="danger" />}
    </FlightCtlForm>
  );
};

type EditLabelsFormProps = {
  device: Device;
  onDeviceUpdate: () => void;
};

export const ViewLabels = ({ device }: { device: Device }) => {
  const currentLabels = device.metadata.labels || {};
  return <LabelsView prefix="read-only-labels" labels={currentLabels} />;
};

const EditLabelsForm = ({ device, onDeviceUpdate }: EditLabelsFormProps) => {
  const { t } = useTranslation();
  const { patch } = useFetch();

  const currentLabels = device.metadata.labels || {};

  return (
    <Formik<EditLabelsFormValues>
      initialValues={{
        labels: fromAPILabel(currentLabels),
      }}
      onSubmit={async (values: EditLabelsFormValues) => {
        try {
          const labelsPatch = getLabelPatches('/metadata/labels', currentLabels, values.labels);
          if (labelsPatch.length > 0) {
            await patch(`devices/${device.metadata.name}`, labelsPatch);
            // The API call is "too" quick, allow the "Saving" button to be briefly seen
            await delayResponse(150);
            onDeviceUpdate();
          }
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
