import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Switch, SwitchProps } from '@patternfly/react-core';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

export interface SwitchFieldProps extends Omit<SwitchProps, 'onChange' | 'ref' | 'checked' | 'id'> {
  name: string;
  labelIcon?: React.ReactElement;
  helperText?: React.ReactNode;
  onChangeCustom?: (value: boolean) => void;
  children?: React.ReactNode;
}

const SwitchField = ({ label, labelIcon, helperText, name, onChangeCustom, children, ...props }: SwitchFieldProps) => {
  const [field, meta, { setValue, setTouched }] = useField({
    name,
  });

  const onChange: SwitchProps['onChange'] = async (_, checked) => {
    await setValue(checked);
    if (onChangeCustom) {
      onChangeCustom(checked);
    }
    await setTouched(true);
  };

  const fieldId = `switchfield-${name}`;

  return (
    <>
      <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId} label={label} labelHelp={labelIcon}>
        <Switch {...field} {...props} id={fieldId} onChange={onChange} isChecked={!!field.value} />
        <DefaultHelperText helperText={helperText} />
        <ErrorHelperText meta={meta} />
      </FormGroup>
      {field.value && children}
    </>
  );
};

export default SwitchField;
