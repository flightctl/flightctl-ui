import * as React from 'react';
import { useField } from 'formik';
import debounce from 'lodash/debounce';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { useFetch } from '../../hooks/useFetch';
import { useTranslation } from '../../hooks/useTranslation';
import RichValidationTextField, { RichValidationTextFieldProps } from './RichValidationTextField';
import { TextFieldProps } from './TextField';
import { DefaultHelperText } from './FieldHelperText';

type NameFieldProps = TextFieldProps & {
  resourceType: string;
  validations: RichValidationTextFieldProps['validations'];
};

const NameField = ({ name, validations, resourceType, ...rest }: NameFieldProps) => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const [{ value }, { error }, { setError }] = useField<string>(name);
  const currentErrorRef = React.useRef<boolean>();
  const abortControllerRef = React.useRef<AbortController>();

  const setValidationError = () => {
    // @ts-expect-error Sets format used by RichValidationTextField
    setError({
      duplicateName: 'failed',
    });
  };

  const validateExistingName = async (value: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    if (!value) {
      currentErrorRef.current = false;
      return;
    }
    try {
      await get(`${resourceType}/${value}`, abortControllerRef.current.signal);
      currentErrorRef.current = true;
      setValidationError();
    } catch (e) {
      currentErrorRef.current = false;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validate = React.useCallback(debounce(validateExistingName, 1000), []);

  React.useEffect(() => {
    currentErrorRef.current = undefined;
    validate(value);
  }, [value, validate]);

  React.useEffect(() => {
    if (!error && currentErrorRef.current) {
      setValidationError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const allValidations = [
    {
      key: 'duplicateName',
      message: t('Name must be unique'),
    },
    ...validations,
  ];

  return <RichValidationTextField fieldName={name} validations={allValidations} {...rest} />;
};

const NameFieldWrapper = ({ name, isDisabled, validations, resourceType, helperText, ...rest }: NameFieldProps) => {
  const [{ value }] = useField<string>(name);

  if (isDisabled) {
    return (
      <FormGroup label={rest?.['aria-label']} isRequired={rest.isRequired}>
        <TextInput value={value} {...rest} isDisabled />
        {helperText && <DefaultHelperText helperText={helperText} />}
      </FormGroup>
    );
  }
  return <NameField name={name} validations={validations} resourceType={resourceType} {...rest} />;
};

export default NameFieldWrapper;
