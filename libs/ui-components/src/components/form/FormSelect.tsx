import * as React from 'react';

import { FormGroup, MenuToggle, MenuToggleStatus, Select, SelectList, SelectOption } from '@patternfly/react-core';
import { useField } from 'formik';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

import './FormSelect.css';

type SelectItem = { label: string; description?: string | React.ReactNode };

type FormSelectProps = {
  name: string;
  items: Record<string, string | SelectItem>;
  helperText?: React.ReactNode;
  children?: React.ReactNode;
  placeholderText?: string;
  withStatusIcon?: boolean;
};

const isItemObject = (item: string | SelectItem): item is SelectItem => typeof item === 'object';

const getItemLabel = (item: string | SelectItem) => (isItemObject(item) ? item.label : item);

const FormSelect = ({
  name,
  items,
  withStatusIcon,
  helperText,
  placeholderText,
  children,
}: React.PropsWithChildren<FormSelectProps>) => {
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

  let statusToggle: MenuToggleStatus;
  if (withStatusIcon) {
    if (field.value) {
      statusToggle = MenuToggleStatus.success;
    } else if (meta.touched) {
      statusToggle = MenuToggleStatus.danger;
    } else {
      statusToggle = MenuToggleStatus.warning;
    }
  }

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Select
        id={fieldId}
        selected={field.value}
        onSelect={(_, value) => {
          setValue(value as string, true);
          setIsOpen(false);
        }}
        shouldFocusToggleOnSelect
        shouldFocusFirstItemOnOpen
        toggle={(toggleRef) => (
          <MenuToggle
            status={statusToggle}
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
              const desc = isItemObject(item) ? item.description : undefined;
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

const FormSelectWrapper = ({ name, items, isDisabled, ...rest }: FormSelectProps & { isDisabled?: boolean }) => {
  const [{ value }] = useField<string>({
    name: name,
  });
  if (isDisabled) {
    const selectedText = value ? getItemLabel(items[value]) : rest.placeholderText;
    return selectedText || value || '-';
  }
  return <FormSelect name={name} items={items} {...rest} />;
};

export default FormSelectWrapper;
