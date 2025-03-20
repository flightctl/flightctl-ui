import * as React from 'react';
import { Formik, FormikProps } from 'formik';
import { Alert } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { Device } from '@flightctl/types';
import LabelsField from '../../form/LabelsField';
import FlightCtlForm from '../../form/FlightCtlForm';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { fromAPILabel } from '../../../utils/labels';
import { validLabelsSchema } from '../../form/validations';
import { getErrorMessage } from '../../../utils/error';
import { getDeviceLabelPatches } from '../../../utils/patch';
import LabelsView from '../../common/LabelsView';

type EditLabelsFormValues = {
  labels: FlightCtlLabel[];
};

type EditLabelsFormContentProps = {
  isSubmitting: FormikProps<EditLabelsFormValues>['isSubmitting'];
  submitForm: (values: EditLabelsFormValues) => Promise<string>;
};

const forbiddenDeviceLabels = ['alias'];

const getValidationSchema = (t: TFunction) => {
  return Yup.object<EditLabelsFormValues>({
    labels: validLabelsSchema(t, forbiddenDeviceLabels),
  });
};

const EditLabelsFormContent = ({ isSubmitting, submitForm }: EditLabelsFormContentProps) => {
  const [submitError, setSubmitError] = React.useState<string>();

  const onChangedLabels = async (newLabels: FlightCtlLabel[], hasErrors: boolean) => {
    setSubmitError(undefined);
    if (!hasErrors) {
      const error = await submitForm({ labels: newLabels });
      setSubmitError(error);
    }
  };

  return (
    <FlightCtlForm>
      <LabelsField name="labels" isLoading={isSubmitting} onChangeCallback={onChangedLabels} />
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

  const currentLabelsMap = device.metadata.labels || {};
  const currentLabelsList = fromAPILabel(currentLabelsMap || {});

  return (
    <Formik<EditLabelsFormValues>
      initialValues={{
        labels: currentLabelsList.filter((label) => label.key !== 'alias'),
      }}
      onSubmit={async (values: EditLabelsFormValues) => {
        try {
          const labelsPatch = getDeviceLabelPatches(currentLabelsMap, values.labels);
          if (labelsPatch.length > 0) {
            await patch(`devices/${device.metadata.name}`, labelsPatch);
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
