import * as React from 'react';
import { useField } from 'formik';
import { FormHelperText, HelperText, HelperTextItem, Label, LabelGroup } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { FlightCtlLabel } from '../../types/extraTypes';
import EditableLabelControl from '../common/EditableLabelControl';

type LabelsFieldProps = {
  name: string;
};

const LabelsField: React.FC<LabelsFieldProps> = ({ name }) => {
  const [{ value: labels }, meta, { setValue: setLabels }] = useField<FlightCtlLabel[]>(name);
  const onClose = (_ev: React.MouseEvent<Element, MouseEvent>, index: number) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels, true);
  };

  const onAdd = (text: string) => {
    const split = text.split('=');
    let newLabel: FlightCtlLabel;
    if (split.length === 2) {
      newLabel = { key: split[0], value: split[1] };
    } else {
      newLabel = { key: text || '', value: '' };
    }

    const newLabels = [...labels, newLabel];
    setLabels(newLabels, true);
  };

  const onEdit = (index: number, nextText: string) => {
    const label = nextText.split('=');
    const newLabels = [...labels];
    newLabels.splice(index, 1, { key: label[0], value: label.length ? label[1] : undefined });
    setLabels(newLabels, true);
  };

  return (
    <>
      <LabelGroup
        numLabels={5}
        isEditable
        addLabelControl={<EditableLabelControl defaultLabel="key=value" onAddLabel={onAdd} />}
      >
        {labels.map(({ key, value }, index) => (
          <Label
            key={index}
            id={`${index}`}
            color="blue"
            onClose={(e) => onClose(e, index)}
            onEditCancel={(_, prevText) => onEdit(index, prevText)}
            onEditComplete={(_, newText) => onEdit(index, newText)}
            isEditable
          >
            {value ? `${key}=${value}` : key}
          </Label>
        ))}
      </LabelGroup>
      {meta.error && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
              {meta.error}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </>
  );
};

export default LabelsField;
