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
import { useTranslation } from '../../hooks/useTranslation';

import './FormSelect.css';

type SelectItem = { label: string; description?: string };

type FormSelectProps = {
  name: string;
  items: Record<string, string | SelectItem>;
  helperText?: React.ReactNode;
  children?: React.ReactNode;
  placeholderText?: string;
  validateNewItem?: (value: string) => string | undefined;
  transformNewItem?: (value: string) => string;
};

const isItemObject = (item: string | SelectItem): item is SelectItem => typeof item === 'object';

const getItemLabel = (item: string | SelectItem) => (isItemObject(item) ? item.label : item);

const CREATE_NEW = 'create';

const FormSelectTypeahead: React.FC<FormSelectProps> = ({
  name,
  items,
  helperText,
  placeholderText,
  children,
  validateNewItem,
  transformNewItem,
}) => {
  const { t } = useTranslation();
  const [field, meta, { setValue, setTouched }] = useField<string>({
    name: name,
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string | undefined>(undefined);
  const [addedItems, setAddedItems] = React.useState<string[]>(
    !field.value || Object.keys(items).some((k) => k === field.value) ? [] : [field.value],
  );

  const fieldId = `selectfield-${name}`;
  const itemKeys = Object.keys(items);

  React.useEffect(() => {
    const hasOneItem = itemKeys.length === 1;
    if (hasOneItem && !field.value) {
      setValue(itemKeys[0], true);
    }
  }, [itemKeys, field.value, setValue]);

  const selectedText = isOpen ? inputValue : field.value ? getItemLabel(items[field.value]) || field.value : undefined;

  const itemValidation = inputValue ? validateNewItem?.(inputValue) : undefined;

  let alreadyAdded = false;
  const inputTransformed = inputValue && transformNewItem ? transformNewItem(inputValue) : inputValue;
  const addedItemsFiltered = addedItems.filter((item) => {
    if (!inputValue) {
      return true;
    }
    if (!alreadyAdded) {
      alreadyAdded = item === inputTransformed;
    }
    return item.includes(inputValue);
  });

  const itemKeysFiltered = itemKeys.filter((key) => {
    if (!inputValue) {
      return true;
    }
    if (!alreadyAdded) {
      alreadyAdded = key === inputTransformed;
    }
    return getItemLabel(items[key]).includes(inputValue);
  });

  const selectOptions = [
    ...addedItemsFiltered.map((item) => (
      <SelectOption className="fctl-form-select__item" key={item} value={item}>
        {item}
      </SelectOption>
    )),
    ...itemKeysFiltered.map((key) => {
      const item = items[key];
      const desc = isItemObject(item) ? item.description : undefined;
      return (
        <SelectOption className="fctl-form-select__item" key={key} value={key} description={desc}>
          {getItemLabel(item)}
        </SelectOption>
      );
    }),
  ];

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Select
        id={fieldId}
        className="fctl-form-select"
        selected={field.value}
        onSelect={(_, value) => {
          let newValue: string = value as string;
          if (value === CREATE_NEW && inputTransformed) {
            setAddedItems([...addedItems, inputTransformed]);
            newValue = inputTransformed;
          }
          setValue(newValue, true);
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
                  setInputValue(value);
                  if (!isOpen) {
                    setIsOpen(true);
                  }
                }}
                id="create-typeahead-select-input"
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
            if (inputValue !== undefined) {
              setInputValue(undefined);
            }
            if (!meta.touched) {
              setTouched(true);
            }
          }
          setIsOpen(open);
        }}
      >
        <SelectList className="fctl-form-select__menu">
          {inputValue && !alreadyAdded && (
            <SelectOption
              className="fctl-form-select__item"
              isDisabled={!!itemValidation}
              description={itemValidation}
              value={CREATE_NEW}
            >
              {t(`Create new option '{{ value }}'`, {
                value: itemValidation ? inputValue : inputTransformed,
              })}
            </SelectOption>
          )}
          {selectOptions}
        </SelectList>
        {children}
      </Select>

      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} />
    </FormGroup>
  );
};

export default FormSelectTypeahead;
