import {
  Checkbox,
  MenuToggle,
  NumberInput,
  Select,
  SelectList,
  SelectOption,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import FieldErrors from './FieldErrors';

// PatternFly Text Widget
const PFTextWidget: React.FC<WidgetProps> = ({ id, value, onChange, disabled, readonly, rawErrors, placeholder }) => {
  const hasError = !!rawErrors?.length;
  return (
    <>
      <TextInput
        id={id}
        value={(value as string) ?? ''}
        type="text"
        onChange={(_event, val) => onChange(val)}
        isDisabled={disabled}
        readOnlyVariant={readonly ? 'default' : undefined}
        validated={hasError ? 'error' : 'default'}
        placeholder={placeholder}
      />
      <FieldErrors errors={rawErrors} />
    </>
  );
};

// PatternFly TextArea Widget
const PFTextareaWidget: React.FC<WidgetProps> = ({
  id,
  value,
  onChange,
  disabled,
  readonly,
  rawErrors,
  placeholder,
}) => {
  const hasError = !!rawErrors?.length;
  return (
    <>
      <TextArea
        id={id}
        value={(value as string) ?? ''}
        onChange={(_event, val) => onChange(val)}
        isDisabled={disabled}
        readOnly={readonly}
        validated={hasError ? 'error' : 'default'}
        placeholder={placeholder}
        style={{ minHeight: '6rem' }}
      />
      <FieldErrors errors={rawErrors} />
    </>
  );
};

// PatternFly Checkbox Widget
const PFCheckboxWidget: React.FC<WidgetProps> = ({ id, value, onChange, disabled, readonly, label, rawErrors }) => {
  return (
    <>
      <Checkbox
        id={id}
        isChecked={!!value}
        onChange={(_event, checked) => onChange(checked)}
        isDisabled={disabled || readonly}
        label={label}
      />
      <FieldErrors errors={rawErrors} />
    </>
  );
};

// PatternFly Select Widget
const PFSelectWidget: React.FC<WidgetProps> = ({
  id,
  value,
  onChange,
  disabled,
  readonly,
  options,
  rawErrors,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasError = !!rawErrors?.length;

  const enumOptions = options.enumOptions ?? [];
  const selectedOption = enumOptions.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label ?? placeholder ?? 'Select...';

  return (
    <>
      <Select
        id={id}
        isOpen={isOpen}
        selected={value as string}
        onSelect={(_event, val) => {
          onChange(val);
          setIsOpen(false);
        }}
        onOpenChange={setIsOpen}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            isDisabled={disabled || readonly}
            status={hasError ? 'danger' : undefined}
            style={{ width: '100%' }}
          >
            {displayValue}
          </MenuToggle>
        )}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {enumOptions.map((option) => (
            <SelectOption key={String(option.value as string)} value={option.value as string}>
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      <FieldErrors errors={rawErrors} />
    </>
  );
};

// PatternFly Number Widget
const PFNumberWidget: React.FC<WidgetProps> = ({ id, value, onChange, disabled, readonly, rawErrors, schema }) => {
  const hasError = !!rawErrors?.length;
  const min = typeof schema.minimum === 'number' ? schema.minimum : undefined;
  const max = typeof schema.maximum === 'number' ? schema.maximum : undefined;

  const numValue = typeof value === 'number' ? value : value ? Number(value) : 0;

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const val = (event.target as HTMLInputElement).value;
    onChange(val === '' ? undefined : Number(val));
  };

  return (
    <>
      <NumberInput
        id={id}
        value={numValue}
        min={min}
        max={max}
        onMinus={() => onChange(numValue - 1)}
        onPlus={() => onChange(numValue + 1)}
        onChange={handleChange}
        isDisabled={disabled || readonly}
        validated={hasError ? 'error' : 'default'}
      />
      <FieldErrors errors={rawErrors} />
    </>
  );
};

// PatternFly Password Widget
const PFPasswordWidget: React.FC<WidgetProps> = ({
  id,
  value,
  onChange,
  disabled,
  readonly,
  rawErrors,
  placeholder,
}) => {
  const hasError = !!rawErrors?.length;
  return (
    <>
      <TextInput
        id={id}
        value={(value as string) ?? ''}
        type="password"
        onChange={(_event, val) => onChange(val)}
        isDisabled={disabled}
        readOnlyVariant={readonly ? 'default' : undefined}
        validated={hasError ? 'error' : 'default'}
        placeholder={placeholder}
      />
      <FieldErrors errors={rawErrors} />
    </>
  );
};

// PatternFly Email Widget
const PFEmailWidget: React.FC<WidgetProps> = ({ id, value, onChange, disabled, readonly, rawErrors, placeholder }) => {
  const hasError = !!rawErrors?.length;
  return (
    <>
      <TextInput
        id={id}
        value={(value as string) ?? ''}
        type="email"
        onChange={(_event, val) => onChange(val)}
        isDisabled={disabled}
        readOnlyVariant={readonly ? 'default' : undefined}
        validated={hasError ? 'error' : 'default'}
        placeholder={placeholder}
      />
      <FieldErrors errors={rawErrors} />
    </>
  );
};

// PatternFly URL Widget
const PFURLWidget: React.FC<WidgetProps> = ({ id, value, onChange, disabled, readonly, rawErrors, placeholder }) => {
  const hasError = !!rawErrors?.length;
  return (
    <>
      <TextInput
        id={id}
        value={(value as string) ?? ''}
        type="url"
        onChange={(_event, val) => onChange(val)}
        isDisabled={disabled}
        readOnlyVariant={readonly ? 'default' : undefined}
        validated={hasError ? 'error' : 'default'}
        placeholder={placeholder}
      />
      <FieldErrors errors={rawErrors} />
    </>
  );
};

export {
  PFTextWidget,
  PFTextareaWidget,
  PFCheckboxWidget,
  PFSelectWidget,
  PFNumberWidget,
  PFPasswordWidget,
  PFEmailWidget,
  PFURLWidget,
};
