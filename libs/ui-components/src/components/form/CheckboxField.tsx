import * as React from 'react';
import { useField } from 'formik';
import { Checkbox, CheckboxProps, FormGroup } from '@patternfly/react-core';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

export interface CheckboxFieldProps extends Omit<CheckboxProps, 'onChange' | 'id' | 'ref'> {
  name: string;
  helperText?: React.ReactNode;
  onChangeCustom?: (value: boolean) => void;
}

const CheckboxField = ({ helperText, onChangeCustom, children, ...props }: CheckboxFieldProps) => {
  const [{ value, ...rest }, meta, { setValue, setTouched }] = useField<boolean>({
    name: props.name,
  });

  const onChange: CheckboxProps['onChange'] = async (_, value) => {
    await setValue(value);
    if (onChangeCustom) {
      onChangeCustom(value);
    }
    await setTouched(true);
  };

  const fieldId = `checkboxfield-${props.name}`;
  return (
    <>
      <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
        <Checkbox {...rest} {...props} isChecked={value} id={fieldId} onChange={onChange} body={value && props.body} />

        <DefaultHelperText helperText={helperText} />
        <ErrorHelperText meta={meta} />
      </FormGroup>
      {value && children}
    </>
  );
};

export default CheckboxField;
