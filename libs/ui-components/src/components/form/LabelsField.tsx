import * as React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';
import { useField } from 'formik';

import { FlightCtlLabel } from '../../types/extraTypes';
import EditableLabelControl from '../common/EditableLabelControl';

type LabelsFieldProps = {
  name: string;
};

const LabelsField: React.FC<LabelsFieldProps> = ({ name }) => {
  const [{ value: labels }, , { setValue: setLabels }] = useField<FlightCtlLabel[]>(name);
  const onClose = (_e: React.MouseEvent<Element, MouseEvent>, index: number) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels);
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
    setLabels(newLabels);
  };

  const onEdit = (index: number, nextText: string) => {
    const label = nextText.split('=');
    const newLabels = [...labels];
    newLabels.splice(index, 1, { key: label[0], value: label.length ? label[1] : undefined });
    setLabels(newLabels);
  };

  return (
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
  );
};

export default LabelsField;
