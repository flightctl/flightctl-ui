import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, TextArea, TextAreaProps } from '@patternfly/react-core';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

interface TextAreaFieldProps extends Omit<TextAreaProps, 'onChange'> {
  name: string;
  helperText?: React.ReactNode;
  onChangeCustom?: (value: string) => void;
  minHeight?: string;
}

const TextAreaField = ({ helperText, onChangeCustom, minHeight = '10rem', ...props }: TextAreaFieldProps) => {
  const [field, meta, { setValue, setTouched }] = useField({
    name: props.name,
  });

  const onChange: TextAreaProps['onChange'] = async (_, value) => {
    await setValue(value);
    if (onChangeCustom) {
      onChangeCustom(value);
    }
    await setTouched(true);
  };

  const fieldId = `textareafield-${props.name}`;
  const hasError = meta.touched && !!meta.error;

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <TextArea
        {...field}
        {...props}
        id={fieldId}
        onChange={onChange}
        validated={hasError ? 'error' : 'default'}
        style={{ minHeight }}
      />

      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} />
    </FormGroup>
  );
};

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;
