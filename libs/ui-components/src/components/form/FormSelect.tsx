import * as React from 'react';

import { FormGroup, MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';
import { useField } from 'formik';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

import './FormSelect.css';

type SelectItem = { label: string; description?: string };

type FormSelectProps = {
  name: string;
  items: Record<string, string | SelectItem>;
  helperText?: React.ReactNode;
  children?: React.ReactNode;
  placeholderText?: string;
};

const getItemLabel = (item: string | SelectItem) => {
  if (typeof item === 'string') {
    return item;
  } else {
    return item.label || '';
  }
};

const FormSelect: React.FC<FormSelectProps> = ({ name, items, helperText, placeholderText, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [field, meta, { setValue, setTouched }] = useField<string>({
    name: name,
  });

  const fieldId = `selectfield-${name}`;
  const itemKeys = Object.keys(items);

  React.useEffect(() => {
    const hasOneItem = itemKeys.length === 1;
    if (hasOneItem && !field.value) {
      setValue(itemKeys[0], true);
    }
  }, [itemKeys, field.value, setValue]);

  const selectedText = field.value ? getItemLabel(items[field.value]) : placeholderText;

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Select
        id={fieldId}
        selected={field.value}
        onSelect={(_, value) => {
          setValue(value as string, true);
          setIsOpen(false);
        }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => {
              if (isOpen && !meta.touched) {
                setTouched(true);
              }
              setIsOpen(!isOpen);
            }}
            isExpanded={isOpen}
            className="fctl-form-select__toggle"
            id={`${fieldId}-menu`}
          >
            {selectedText}
          </MenuToggle>
        )}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open && !meta.touched) {
            setTouched(true);
          }
          setIsOpen(open);
        }}
      >
        {!!itemKeys.length && (
          <SelectList className="fctl-form-select__menu">
            {itemKeys.map((key) => {
              const item = items[key];
              const desc = typeof item === 'string' ? '' : item.description;
              return (
                <SelectOption key={key} value={key} description={desc}>
                  {getItemLabel(item)}
                </SelectOption>
              );
            })}
          </SelectList>
        )}
        {children}
      </Select>

      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} />
    </FormGroup>
  );
};

export default FormSelect;
