import * as React from 'react';
import { useField } from 'formik';
import { Label, LabelGroup } from '@patternfly/react-core';

import { FlightCtlLabel } from '../../types/extraTypes';
import EditableLabelControl from '../common/EditableLabelControl';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

type LabelsFieldProps = {
  name: string;
  isLoading?: boolean;
  addButtonText?: string;
  helperText?: React.ReactNode;
  onChangeCallback?: (newLabels: FlightCtlLabel[], hasErrors: boolean) => void;
  canEdit?: boolean;
};

const maxWidthDefaultLabel = '18ch'; // Can fit more chars as it doesn't have a "Close" button
const maxWidthNonDefaultLabel = '16ch'; // Can fit less chars due to the "Close" button

const LabelsField: React.FC<LabelsFieldProps> = ({
  name,
  onChangeCallback,
  addButtonText,
  helperText,
  isLoading,
  canEdit = true,
}) => {
  const [{ value: labels }, meta, { setValue: setLabels }] = useField<FlightCtlLabel[]>(name);
  const updateLabels = async (newLabels: FlightCtlLabel[]) => {
    const errors = await setLabels(newLabels, true);
    const hasErrors = Object.keys(errors || {}).length > 0;

    onChangeCallback?.(newLabels, hasErrors);
  };

  const onDelete = async (_ev: React.MouseEvent<Element, MouseEvent>, index: number) => {
    if (isLoading) {
      return;
    }
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    await updateLabels(newLabels);
  };

  const onAdd = async (text: string) => {
    if (!text) {
      return;
    }
    const split = text.split('=');
    let newLabel: FlightCtlLabel;
    if (split.length === 2) {
      newLabel = { key: split[0], value: split[1] };
    } else {
      newLabel = { key: text || '', value: '' };
    }

    const newLabels = [...labels, newLabel];

    await updateLabels(newLabels);
  };

  const onEdit = async (index: number, nextText: string) => {
    const label = nextText.split('=');
    const newLabels = [...labels];
    newLabels.splice(index, 1, { key: label[0], value: label.length ? label[1] : undefined });

    await updateLabels(newLabels);
  };

  return (
    <>
      <LabelGroup
        numLabels={5}
        isEditable={!isLoading}
        addLabelControl={
          canEdit && (
            <EditableLabelControl
              defaultLabel="key=value"
              addButtonText={addButtonText}
              onAddLabel={onAdd}
              isEditable={!isLoading}
            />
          )
        }
      >
        {labels.map(({ key, value, isDefault }, index) => {
          const text = value ? `${key}=${value}` : key;
          const elKey = `${key}__${index}`;
          if (isDefault) {
            return (
              <Label key={elKey} textMaxWidth={maxWidthDefaultLabel}>
                {text}
              </Label>
            );
          }

          const closeButtonProps = isLoading && { isDisabled: true };
          const isLabelEditable = !isLoading && !isDefault && canEdit;
          return (
            <Label
              key={elKey}
              textMaxWidth={maxWidthNonDefaultLabel}
              closeBtnProps={closeButtonProps}
              onClose={canEdit ? (e) => onDelete(e, index) : undefined}
              onEditCancel={(_, prevText) => onEdit(index, prevText)}
              onEditComplete={(_, newText) => onEdit(index, newText)}
              /* Add a basic tooltip as the PF tooltip doesn't work for editable labels */
              title={isLabelEditable ? text : undefined}
              isEditable={isLabelEditable}
            >
              {text}
            </Label>
          );
        })}
      </LabelGroup>
      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} touchRequired={false} />
    </>
  );
};

export default LabelsField;
