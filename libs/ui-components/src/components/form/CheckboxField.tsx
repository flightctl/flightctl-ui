import * as React from 'react';
import { useField } from 'formik';
import { Checkbox, CheckboxProps, FormGroup, FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

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
  const hasError = meta.touched && !!meta.error;

  return (
    <>
      <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
        <Checkbox {...rest} {...props} isChecked={value} id={fieldId} onChange={onChange} body={value && props.body} />

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
      {value && children}
    </>
  );
};

export default CheckboxField;
