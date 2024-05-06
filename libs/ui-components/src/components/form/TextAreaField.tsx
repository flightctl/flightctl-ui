import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, FormHelperText, HelperText, HelperTextItem, TextArea, TextAreaProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

interface TextAreaFieldProps extends Omit<TextAreaProps, 'onChange'> {
  name: string;
  helperText?: React.ReactNode;
  onChangeCustom?: (value: string) => void;
}

const TextAreaField = ({ helperText, onChangeCustom, ...props }: TextAreaFieldProps) => {
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
      <TextArea {...field} {...props} id={fieldId} onChange={onChange} validated={hasError ? 'error' : 'default'} />

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
};

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;
