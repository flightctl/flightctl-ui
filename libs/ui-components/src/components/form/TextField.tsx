import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

interface TextFieldProps extends Omit<TextInputProps, 'onChange'> {
  name: string;
  helperText?: React.ReactNode;
  onChangeCustom?: (value: string) => void;
}

const TextField = React.forwardRef(
  ({ helperText, onChangeCustom, ...props }: TextFieldProps, ref: React.Ref<HTMLInputElement>) => {
    const [field, meta, { setValue, setTouched }] = useField({
      name: props.name,
    });

    const onChange: TextInputProps['onChange'] = async (_, value) => {
      await setValue(value);
      if (onChangeCustom) {
        onChangeCustom(value);
      }
      await setTouched(true);
    };

    const fieldId = `textfield-${props.name}`;
    const hasError = meta.touched && !!meta.error;

    return (
      <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
        <TextInput
          {...field}
          {...props}
          ref={ref}
          id={fieldId}
          onChange={onChange}
          validated={hasError ? 'error' : 'default'}
        />

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
  },
);

TextField.displayName = 'TextField';

export default TextField;
