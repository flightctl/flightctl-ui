import * as React from 'react';

import {
  Button,
  FormGroup,
  MenuFooter,
  MenuToggle,
  MenuToggleStatus,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { useField } from 'formik';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

import './FormSelect.css';

export type SelectItem = {
  label: React.ReactNode;
  description?: React.ReactNode;
  isDisabled?: boolean;
  selectedLabel?: React.ReactNode;
};

type AddAction = {
  label: React.ReactNode;
  onAdd: VoidFunction;
};

type FormSelectProps = {
  name: string;
  items: Record<string, string | SelectItem>;
  helperText?: React.ReactNode;
  children?: React.ReactNode;
  placeholderText?: string;
  withStatusIcon?: boolean;
  onChange?: (value: string) => void;
  addAction?: AddAction;
};

const isItemObject = (item: string | SelectItem): item is SelectItem => typeof item === 'object';

const getItemLabel = (item: string | SelectItem) => (isItemObject(item) ? item.label : item);

const getItemSelectLabel = (item: string | SelectItem) =>
  isItemObject(item) ? item.selectedLabel || item.label : item;

const FormSelect = ({
  name,
  items,
  withStatusIcon,
  helperText,
  placeholderText,
  children,
  onChange,
  addAction,
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
      const firstItem = items[itemKeys[0]];
      if (!isItemObject(firstItem) || !firstItem.isDisabled) {
        setValue(itemKeys[0], true);
      }
    }
  }, [itemKeys, field.value, setValue, items]);

  const selectedText = field.value ? getItemSelectLabel(items[field.value]) : placeholderText;

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
          onChange?.(value as string);
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
              let desc: React.ReactNode;
              let isDisabled = false;
              if (isItemObject(item)) {
                desc = item.description || '';
                isDisabled = Boolean(item.isDisabled);
              }
              return (
                <SelectOption key={key} value={key} description={desc} isDisabled={isDisabled}>
                  {getItemLabel(item)}
                </SelectOption>
              );
            })}
          </SelectList>
        )}
        {children}
        {addAction && (
          <MenuFooter>
            <Button
              variant="link"
              isInline
              icon={<PlusCircleIcon />}
              onClick={() => {
                setIsOpen(false);
                addAction.onAdd();
              }}
            >
              {addAction.label}
            </Button>
          </MenuFooter>
        )}
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
