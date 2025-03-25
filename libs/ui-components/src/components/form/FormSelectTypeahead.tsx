import * as React from 'react';

import {
  FormGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';
import { useField } from 'formik';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

import './FormSelect.css';

type SelectItem = { label: string; description?: string };

type FormSelectProps = {
  name: string;
  items: Record<string, string | SelectItem>;
  defaultId?: string;
  helperText?: React.ReactNode;
  children?: React.ReactNode;
  placeholderText?: string;
  isValidTypedItem?: (value: string) => boolean;
  transformTypedItem?: (value: string) => string;
};

const isItemObject = (item: string | SelectItem): item is SelectItem => typeof item === 'object';

const getItemLabel = (item: string | SelectItem) => (isItemObject(item) ? item.label : item);

const FormSelectTypeahead = ({
  name,
  items,
  defaultId,
  helperText,
  placeholderText,
  isValidTypedItem,
  transformTypedItem,
  children,
}: FormSelectProps) => {
  const [field, meta, { setValue, setTouched }] = useField<string>({
    name: name,
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string | undefined>(undefined);

  const currentValue = field.value;

  const fieldId = `selectfield-${name}`;
  const itemKeys = Object.keys(items);

  let defaultValue = '';
  if (defaultId) {
    const defaultItem = items[defaultId];
    defaultValue = isItemObject(defaultItem) ? defaultItem.description || '' : defaultItem;
  }

  React.useEffect(() => {
    const hasOneItem = itemKeys.length === 1;
    if (hasOneItem && !currentValue) {
      setValue(itemKeys[0], true);
    }
  }, [itemKeys, currentValue, setValue]);

  let selectedText = defaultValue;
  if (inputValue) {
    selectedText = inputValue;
  } else if (currentValue) {
    selectedText = getItemLabel(items[currentValue]) || currentValue;
  }

  const itemKeysFiltered = itemKeys.filter((key) => {
    if (!inputValue) {
      return true;
    }
    return getItemLabel(items[key]).toLowerCase().includes(inputValue.toLowerCase());
  });

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Select
        id={fieldId}
        className="fctl-form-select"
        selected={currentValue || defaultId}
        onSelect={(_, value) => {
          setTouched(true);
          setValue(value as string, true);
          setInputValue(undefined);
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
            variant="typeahead"
          >
            <TextInputGroup isPlain>
              <TextInputGroupMain
                value={selectedText}
                onClick={() => {
                  if (isOpen && !meta.touched) {
                    setTouched(true);
                  }
                  setIsOpen(!isOpen);
                }}
                onChange={(_, value) => {
                  setInputValue(value || undefined);
                  if (!isOpen) {
                    setIsOpen(true);
                  }
                }}
                onBlur={() => {
                  if (!inputValue) {
                    return;
                  }

                  // If there is no "isValidTypedItem", it means selection must always be done by selecting from the list
                  const skipSetValue = isValidTypedItem ? !isValidTypedItem(inputValue) : true;
                  if (skipSetValue) {
                    if (itemKeysFiltered.length === 0) {
                      setInputValue(undefined);
                      setIsOpen(false);
                    } else {
                      // The typed text has no matches from the list. We clear the value to use the default/empty
                      setValue('');
                    }
                    return;
                  }
                  const transformedValue = transformTypedItem?.(inputValue) || inputValue;
                  setInputValue(undefined);
                  void setValue(transformedValue);
                  setIsOpen(false);
                }}
                id={`create-typeahead-select-input-${name}`}
                autoComplete="off"
                role="combobox"
                isExpanded={isOpen}
                aria-controls="select-create-typeahead-listbox"
                placeholder={placeholderText}
              />
            </TextInputGroup>
          </MenuToggle>
        )}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (!meta.touched) {
              setTouched(true);
            }
          }
          setIsOpen(open);
        }}
      >
        <SelectList className="fctl-form-select__menu">
          {itemKeysFiltered.map((key) => {
            const item = items[key];
            const desc = isItemObject(item) ? item.description : undefined;
            return (
              <SelectOption className="fctl-form-select__item" key={key} value={key} description={desc}>
                {getItemLabel(item)}
              </SelectOption>
            );
          })}
        </SelectList>
        {children}
      </Select>

      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} />
    </FormGroup>
  );
};

export default FormSelectTypeahead;
