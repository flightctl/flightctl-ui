import * as React from 'react';
import { useField } from 'formik';
import { Label, LabelGroup, Content, ContentVariants } from '@patternfly/react-core';

import EditableLabelControl from '../common/EditableLabelControl';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';
import { useTranslation } from '../../hooks/useTranslation';

type ListItemFieldProps = {
  name: string;
  isLoading?: boolean;
  helperText?: React.ReactNode;
  addButtonText?: string;
  resolvedValue?: string | ((items: string[]) => string);
  resolvedLabel?: string;
};

const maxWidthLabel = '18ch';

const ListItemField = ({
  name,
  helperText,
  isLoading,
  addButtonText,
  resolvedValue,
  resolvedLabel,
}: ListItemFieldProps) => {
  const { t } = useTranslation();
  const [{ value: items }, meta, { setValue: setItems }] = useField<string[]>(name);

  const updateItems = async (newItems: string[]) => {
    await setItems(newItems, true);
  };

  const onDelete = async (_ev: React.MouseEvent<Element, MouseEvent>, index: number) => {
    if (isLoading) {
      return;
    }
    const newItems = [...items];
    newItems.splice(index, 1);
    await updateItems(newItems);
  };

  const onAdd = async (text: string) => {
    if (!text || !text.trim()) {
      return;
    }
    const trimmedText = text.trim();
    const newItems = [...items, trimmedText];
    await updateItems(newItems);
  };

  const onEdit = async (index: number, nextText: string) => {
    const trimmedText = nextText.trim();
    if (!trimmedText) {
      return;
    }

    const newItems = [...items];
    newItems.splice(index, 1, trimmedText);
    await updateItems(newItems);
  };

  const getResolvedValue = () => {
    if (!resolvedValue || items.length === 0) {
      return null;
    }
    if (typeof resolvedValue === 'function') {
      return resolvedValue(items);
    }
    return resolvedValue;
  };

  const displayedResolvedValue = getResolvedValue();

  return (
    <>
      <DefaultHelperText helperText={helperText} />

      <LabelGroup
        numLabels={5}
        isEditable={!isLoading}
        addLabelControl={
          <EditableLabelControl
            defaultLabel=""
            addButtonText={addButtonText || t('Add item')}
            onAddLabel={onAdd}
            isEditable={!isLoading}
          />
        }
      >
        {items.map((item, index) => {
          const elKey = `${item}__${index}`;
          const closeButtonProps = isLoading ? { isDisabled: true } : undefined;
          const isItemEditable = !isLoading;

          return (
            <Label
              key={elKey}
              textMaxWidth={maxWidthLabel}
              closeBtnProps={closeButtonProps}
              onClose={(e) => onDelete(e, index)}
              onEditCancel={(_, prevText) => onEdit(index, prevText)}
              onEditComplete={(_, newText) => onEdit(index, newText)}
              title={isItemEditable ? item : undefined}
              isEditable={isItemEditable}
            >
              {item}
            </Label>
          );
        })}
      </LabelGroup>
      {displayedResolvedValue && (
        <Content component={ContentVariants.small} style={{ marginTop: '0.5rem', color: "var(--pf-t--temp--dev--tbd)"/* CODEMODS: original v5 color was --pf-v5-global--Color--200 */ }}>
          {resolvedLabel || t('Resolved')}: <strong>{displayedResolvedValue}</strong>
        </Content>
      )}
      <ErrorHelperText meta={meta} touchRequired={false} />
    </>
  );
};

export default ListItemField;
