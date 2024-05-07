import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useField } from 'formik';
import * as React from 'react';

import './FormSelect.css';

type FormSelectProps = {
  name: string;
  items: Record<string, React.ReactNode>;
  helperText?: React.ReactNode;
  children?: React.ReactNode;
};

const FormSelect: React.FC<FormSelectProps> = ({ name, items, helperText, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [field, meta, { setValue, setTouched }] = useField<string>({
    name: name,
  });

  const fieldId = `textfield-${name}`;
  const hasError = meta.touched && !!meta.error;
  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Select
        id={fieldId}
        selected={field.value}
        onSelect={(_, value) => {
          setValue(value as string);
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
          >
            {items[field.value] || ''}
          </MenuToggle>
        )}
        isOpen={isOpen}
        className="fctl-form-select__menu"
        onOpenChange={(open) => {
          if (!open && !meta.touched) {
            setTouched(true);
          }
          setIsOpen(open);
        }}
      >
        {!!Object.keys(items).length && (
          <SelectList>
            {Object.keys(items).map((key) => (
              <SelectOption key={key} value={key}>
                {items[key]}
              </SelectOption>
            ))}
          </SelectList>
        )}
        {children}
      </Select>
      {helperText && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant={'default'}>{helperText}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      {hasError && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem icon={<ExclamationCircleIcon />} variant={'error'}>
              {meta.error}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default FormSelect;
