import * as React from 'react';
import { useField } from 'formik';
import { Label, LabelGroup } from '@patternfly/react-core';

import EditableLabelControl from '../common/EditableLabelControl';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

type TextListFieldProps = {
  name: string;
  isLoading?: boolean;
  addButtonText?: string;
  helperText?: React.ReactNode;
  onChangeCallback?: (newList: string[], hasErrors: boolean) => void;
  canEdit?: boolean;
};

const maxWidth = '16ch';

const TextListField = ({ name, onChangeCallback, addButtonText, helperText }: TextListFieldProps) => {
  const [{ value: valueList }, meta, { setValue: setValueList, setTouched }] = useField<string[]>(name);
  const updateValueList = async (newValueList: string[]) => {
    const errors = await setValueList(newValueList, true);
    const hasErrors = Object.keys(errors || {}).length > 0;

    setTouched(true);
    onChangeCallback?.(newValueList, hasErrors);
  };

  const onDelete = async (index: number) => {
    const newValueList = [...valueList];
    newValueList.splice(index, 1);
    await updateValueList(newValueList);
  };

  const onAdd = async (text: string) => {
    if (text) {
      await updateValueList([...valueList, text]);
    } else {
      setTouched(true);
    }
  };

  const onEdit = async (index: number, newValue: string) => {
    const newLabels = [...valueList];
    newLabels.splice(index, 1, newValue);

    await updateValueList(newLabels);
  };

  return (
    <>
      <LabelGroup
        numLabels={5}
        isEditable
        addLabelControl={
          <EditableLabelControl defaultLabel="" addButtonText={addButtonText} onAddLabel={onAdd} isEditable />
        }
      >
        {valueList.map((text, index) => {
          return (
            <Label
              key={`${text}_${index}`}
              textMaxWidth={maxWidth}
              onClose={() => onDelete(index)}
              onEditCancel={(_, prevText) => onEdit(index, prevText)}
              onEditComplete={(_, newText) => onEdit(index, newText)}
              /* Add a basic tooltip as the PF tooltip doesn't work for editable labels */
              title={text}
              isEditable
            >
              {text}
            </Label>
          );
        })}
      </LabelGroup>
      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} />
    </>
  );
};

const TextListFieldWrapper = ({ name, isReadOnly, ...rest }: TextListFieldProps & { isReadOnly: boolean }) => {
  const [{ value: valueList }] = useField<string[]>(name);

  if (isReadOnly) {
    return valueList.length === 0
      ? '-'
      : valueList.map((text, index) => (
          <Label key={`${text}_${index}`} textMaxWidth={maxWidth}>
            {text}
          </Label>
        ));
  }

  return <TextListField name={name} {...rest} />;
};

export default TextListFieldWrapper;
