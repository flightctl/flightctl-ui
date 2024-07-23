import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Radio, RadioProps } from '@patternfly/react-core';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

export interface RadioFieldProps extends Omit<RadioProps, 'onChange' | 'ref' | 'checked'> {
  checkedValue?: unknown;
  name: string;
  helperText?: React.ReactNode;
  onChangeCustom?: (checkedValue: unknown) => void;
  noDefaultOnChange?: boolean;
}

const RadioField = ({
  helperText,
  checkedValue,
  name,
  onChangeCustom,
  noDefaultOnChange,
  ...props
}: RadioFieldProps) => {
  const [field, meta, { setValue, setTouched }] = useField({
    name,
  });

  const onChange: RadioProps['onChange'] = async (_, checked) => {
    if (checked) {
      if (onChangeCustom) {
        onChangeCustom(checkedValue);
      }
      if (noDefaultOnChange) {
        return;
      }
      await setValue(checkedValue || true, true);
      await setTouched(true);
    }
  };

  const fieldId = `radiofield-${props.id}`;

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Radio
        {...field}
        {...props}
        id={fieldId}
        onChange={onChange}
        isChecked={checkedValue ? field.value === checkedValue : !!field.value}
      />

      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} />
    </FormGroup>
  );
};

export default RadioField;
