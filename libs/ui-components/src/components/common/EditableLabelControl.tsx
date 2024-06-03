import * as React from 'react';
import { Label, TextInput } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

type EditableLabelControlProps = {
  isEditable?: boolean;
  addButtonText?: string;
  defaultLabel: string;
  onAddLabel: (text: string) => void;
};

const EditableLabelControl = ({
  addButtonText,
  defaultLabel,
  onAddLabel,
  isEditable = true,
}: EditableLabelControlProps) => {
  const [isEditing, setIsEditing] = React.useState<boolean>();
  const [label, setLabel] = React.useState<string>('');
  const { t } = useTranslation();

  const onConfirmAdd = () => {
    if (label) {
      onAddLabel(label);
      setIsEditing(false);
      setLabel('');
    }
  };

  const onDiscardAdd = () => {
    setIsEditing(false);
    setLabel('');
  };

  return isEditing ? (
    <TextInput
      aria-label={t('New label')}
      autoFocus
      value={label}
      onChange={(ev: React.FormEvent<HTMLInputElement>) => {
        setLabel(ev.currentTarget.value);
      }}
      onBlur={onConfirmAdd}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onConfirmAdd();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onDiscardAdd();
        }
      }}
    />
  ) : (
    <Label
      isDisabled={!isEditable}
      color="blue"
      variant="outline"
      isOverflowLabel
      onClick={() => {
        setIsEditing(true);
        setLabel(defaultLabel);
      }}
    >
      {addButtonText || t('Add label')}
    </Label>
  );
};

export default EditableLabelControl;
