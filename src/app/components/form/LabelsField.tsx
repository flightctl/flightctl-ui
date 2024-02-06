import { Label, LabelGroup } from '@patternfly/react-core';
import * as React from 'react';

type LabelsFieldProps = {
  labels: { key: string; value: string }[];
  setLabels: (newLabels: { key: string; value: string }[]) => void;
};

const LabelsField: React.FC<LabelsFieldProps> = ({ labels, setLabels }) => {
  const onClose = (e: React.MouseEvent<Element, MouseEvent>, index: number) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels);
  };

  const onAdd = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.preventDefault();

    const newLabels = [...labels, { key: 'key', value: 'value' }];
    setLabels(newLabels);
  };

  const onEdit = (index: number, nextText: string) => {
    const label = nextText.split('=');
    const newLabels = [...labels];
    newLabels.splice(index, 1, { key: label[0], value: label[1] });
    setLabels(newLabels);
  };

  return (
    <LabelGroup
      numLabels={5}
      isEditable
      addLabelControl={
        <Label color="blue" variant="outline" isOverflowLabel onClick={onAdd}>
          Add label
        </Label>
      }
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
          {`${key}=${value}`}
        </Label>
      ))}
    </LabelGroup>
  );
};

export default LabelsField;
