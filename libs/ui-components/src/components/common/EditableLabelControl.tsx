import * as React from 'react';
import { Button, TextInput } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

type EditableLabelControlProps = {
  isEditable?: boolean;
  addButtonText?: string;
  placeholder?: string;
  onAddLabel: (text: string) => void;
  className?: string;
};

const EditableLabelControl = ({
  addButtonText,
  placeholder,
  onAddLabel,
  isEditable = true,
  className,
}: EditableLabelControlProps) => {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [label, setLabel] = React.useState<string>('');
  const { t } = useTranslation();

  const onConfirmAdd = () => {
    onAddLabel(label);
    setIsEditing(false);
    setLabel('');
  };

  const onDiscardAdd = () => {
    setIsEditing(false);
    setLabel('');
  };

  return isEditing ? (
    <TextInput
      aria-label={t('New label')}
      autoFocus
      placeholder={placeholder}
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
    <Button
      aria-label={addButtonText || t('Add label')}
      variant="link"
      isInline
      isDisabled={!isEditable}
      className={className}
      onClick={() => {
        setIsEditing(true);
      }}
    >
      {addButtonText || t('Add label')}
    </Button>
  );
};

export default EditableLabelControl;
