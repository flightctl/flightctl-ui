import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, NumberInput, NumberInputProps as PFNumberInputProps } from '@patternfly/react-core';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

export interface NumberFieldProps extends Omit<PFNumberInputProps, 'onChange'> {
  name: string;
  isRequired?: boolean;
  helperText?: React.ReactNode;
}

const NumberField = React.forwardRef(
  ({ helperText, min = 0, max, isRequired, ...props }: NumberFieldProps, ref: React.Ref<HTMLInputElement>) => {
    const [field, meta, { setValue, setTouched }] = useField<number | ''>({
      name: props.name,
    });

    const doChange = (value: number) => {
      let newValue = value < (min || 0) ? min : value;
      newValue = max && newValue > max ? max : newValue;
      if (field.value !== newValue) {
        setValue(newValue);
      }
    };

    const onPlus: PFNumberInputProps['onPlus'] = () => {
      doChange(field.value ? field.value + 1 : min);
    };

    const onMinus: PFNumberInputProps['onMinus'] = () => {
      doChange(field.value ? field.value - 1 : min);
    };

    const handleChange: PFNumberInputProps['onChange'] = (event: React.FormEvent<HTMLInputElement>) => {
      const valStr = (event.target as HTMLInputElement).value;
      // Skip updating the value onBlur. Otherwise, when the field is cleared PF sets a numeric value onBlur.
      if (event.type === 'change') {
        if (!isRequired && valStr === '') {
          setValue('');
        } else {
          const targetValue = valStr as unknown as number;
          doChange(Number.isNaN(targetValue) ? min : Number(targetValue));
          setTouched(true);
        }
      }
    };

    const fieldId = `numberfield-${props.name}`;
    const hasError = meta.touched && !!meta.error;

    return (
      <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
        <NumberInput
          className="fc-number-input"
          {...field}
          {...props}
          // Prevent the NumberInput setting the value to 0 when it's not defined
          value={field.value === undefined && !isRequired ? '' : field.value}
          min={min}
          max={max}
          ref={ref}
          inputName={fieldId}
          onMinus={onMinus}
          onChange={handleChange}
          onPlus={onPlus}
          validated={hasError ? 'error' : 'default'}
        />

        <DefaultHelperText helperText={helperText} />
        <ErrorHelperText meta={meta} />
      </FormGroup>
    );
  },
);

NumberField.displayName = 'NumberField';

export default NumberField;
