import { Label, LabelGroup } from '@patternfly/react-core';
import * as React from 'react';

type LabelsFieldProps = {
  labels: { [key: string]: string };
  setLabels: (newLabels: { [key: string]: string }) => void;
};

const LabelsField: React.FC<LabelsFieldProps> = ({ labels, setLabels }) => {
  const onClose = (e: React.MouseEvent<Element, MouseEvent>, labelKey: string) => {
    const newLabels = { ...labels };
    delete newLabels[labelKey];
    setLabels(newLabels);
  };

  const onAdd = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.preventDefault();
    const newLabels = { ...labels, newLabel: 'newValue' };
    setLabels(newLabels);
  };

  const onEdit = (labelKey: string, nextText: string) => {
    const label = nextText.split('=');
    const newLabels = { ...labels };
    delete newLabels[labelKey];
    newLabels[label[0]] = label[1];
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
      {Object.keys(labels).map((labelKey) => (
        <Label
          key={labelKey}
          id={labelKey}
          color="blue"
          onClose={(e) => onClose(e, labelKey)}
          onEditCancel={(_, prevText) => onEdit(labelKey, prevText)}
          onEditComplete={(_, newText) => onEdit(labelKey, newText)}
          isEditable
        >
          {`${labelKey}=${labels[labelKey]}`}
        </Label>
      ))}
    </LabelGroup>
  );
};

export default LabelsField;
