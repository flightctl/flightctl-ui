import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Switch, type SwitchProps } from '@patternfly/react-core';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

export interface SwitchFieldProps extends Omit<SwitchProps, 'onChange' | 'ref' | 'checked' | 'id'> {
  name: string;
  helperText?: React.ReactNode;
  confirmText?: React.ReactNode;
  onChangeCustom?: (value: boolean) => void;
  noDefaultOnChange?: boolean;
}

const SwitchField = ({ name, helperText, onChangeCustom, noDefaultOnChange, ...props }: SwitchFieldProps) => {
  const [field, meta, { setValue, setTouched }] = useField({
    name,
  });

  const onChange: SwitchProps['onChange'] = async (_, checked) => {
    if (onChangeCustom) {
      onChangeCustom(checked);
    }
    if (noDefaultOnChange) {
      return;
    }
    await setValue(checked);
    await setTouched(true);
  };

  const fieldId = `switchfield-${name}`;

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Switch {...field} {...props} id={fieldId} onChange={onChange} isChecked={!!field.value} />
      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} />
    </FormGroup>
  );
};

export default SwitchField;
