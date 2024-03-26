import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import { Alert, Bullseye, Button, Form, FormGroup, Modal, Spinner, Stack, StackItem } from '@patternfly/react-core';

import { getErrorMessage } from '@app/utils/error';
import LabelsField from '@app/components/form/LabelsField';
import FlightCtlActionGroup from '@app/components/form/FlightCtlActionGroup';
import { FlightCtlLabel, LabelEditable } from '@app/types/extraTypes';
import { useFetch } from '@app/hooks/useFetch';
import { Device, Fleet } from '@types';

type EditLabelsModalProps<MT extends LabelEditable> = {
  resourceType: 'fleets' | 'devices';
  resourceName: string;
  submitTransformer: (data: MT, updatedLabels: FlightCtlLabel[]) => MT;
  onClose: (success?: boolean) => void;
};

type EditLabelsFormProps = {
  onClose: VoidFunction;
  error: string | undefined;
};

type EditLabelsFormValues = {
  labels: FlightCtlLabel[];
};

const EditLabelsForm = ({ onClose, error }: EditLabelsFormProps) => {
  const { values, setFieldValue, submitForm, isSubmitting } = useFormikContext<EditLabelsFormValues>();
  return (
    <Form>
      <FormGroup label="Labels">
        <LabelsField labels={values.labels} setLabels={(labels) => setFieldValue('labels', labels)} />
      </FormGroup>
      {error && <Alert isInline title={error} variant="danger" />}
      <FlightCtlActionGroup>
        <Button key="confirm" variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
          Edit labels
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </FlightCtlActionGroup>
    </Form>
  );
};

function EditLabelsModal<T extends LabelEditable>({
  resourceType,
  resourceName,
  submitTransformer,
  onClose,
}: EditLabelsModalProps<T>) {
  const { get, put } = useFetch();
  const [error, setError] = React.useState<string>();
  const [dataItem, setDataItem] = React.useState<T>();
  const queryEndpoint = `${resourceType}/${resourceName}`;

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await get<T>(queryEndpoint);
        if (data) {
          setDataItem(data);
        }
      } catch (e) {
        setError(getErrorMessage(e));
      }
    };
    void loadData();
  }, [get, queryEndpoint]);

  if (!dataItem && !error) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  let labels: Record<string, string>;
  if (resourceType === 'fleets') {
    const fleet = dataItem as Fleet;
    labels = fleet?.spec?.selector?.matchLabels || {};
  } else {
    const device = dataItem as Device;
    labels = device?.metadata?.labels || {};
  }

  return (
    <Formik<EditLabelsFormValues>
      initialValues={{
        labels: Object.entries(labels).map((labelEntry) => ({
          key: labelEntry[0],
          value: labelEntry[1],
        })),
      }}
      onSubmit={async ({ labels }) => {
        try {
          const updatedData = submitTransformer(dataItem!, labels);
          await put(queryEndpoint, updatedData);
          onClose(true);
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
    >
      <Modal title={`Edit fleet labels`} isOpen onClose={() => onClose()} variant="small">
        <Stack hasGutter>
          <StackItem>
            {dataItem ? (
              <EditLabelsForm onClose={onClose} error={error} />
            ) : (
              <Alert
                isInline
                title={`Failed to retrieve the labels of ${resourceType} ${resourceName}`}
                variant="danger"
              >
                {error}
              </Alert>
            )}
          </StackItem>
        </Stack>
      </Modal>
    </Formik>
  );
}

export default EditLabelsModal;
