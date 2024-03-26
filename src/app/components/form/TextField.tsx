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
import { ExclamationCircleIcon } from '@patternfly/react-icons';

interface TextFieldProps extends TextInputProps {
  name: string;
  helperText?: React.ReactNode;
}

const TextField = React.forwardRef(({ helperText, ...props }: TextFieldProps, ref: React.Ref<HTMLInputElement>) => {
  const x = useField({
    name: props.name,
  });

  const [field, meta, { setValue }] = x;

  const onChange = (_ev, value: string) => {
    void setValue(value);
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
});

TextField.displayName = 'TextField';

export default TextField;
