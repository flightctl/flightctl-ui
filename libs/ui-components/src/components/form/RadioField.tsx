import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, FormHelperText, HelperText, HelperTextItem, Radio, RadioProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

export interface RadioFieldrops extends Omit<RadioProps, 'onChange' | 'ref' | 'checked'> {
  checkedValue?: unknown;
  name: string;
  helperText?: React.ReactNode;
}

const RadioField = ({ helperText, checkedValue, name, ...props }: RadioFieldrops) => {
  const [field, meta, { setValue, setTouched }] = useField({
    name,
  });

  const onChange: RadioProps['onChange'] = async (_, checked) => {
    if (checked) {
      await setValue(checkedValue || true, true);
      await setTouched(true);
    }
  };

  const fieldId = `radiofield-${props.id}`;
  const hasError = meta.touched && !!meta.error;

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId}>
      <Radio
        {...field}
        {...props}
        id={fieldId}
        onChange={onChange}
        isChecked={checkedValue ? field.value === checkedValue : !!field.value}
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
};

RadioField.displayName = 'RadioField';

export default RadioField;
