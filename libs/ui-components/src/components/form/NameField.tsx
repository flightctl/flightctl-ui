import * as React from 'react';
import TextField, { TextFieldProps } from './TextField';
import { useField } from 'formik';
import debounce from 'lodash/debounce';
import { useFetch } from '../../hooks/useFetch';

type NameFieldProps = TextFieldProps & {
  getExistsErrMsg: (value: string) => string;
  resourceType: string;
};

const NameField: React.FC<NameFieldProps> = ({ name, isDisabled, resourceType, getExistsErrMsg, ...rest }) => {
  const { get } = useFetch();
  const [{ value }, { error }, { setError }] = useField<string>(name);
  const currentErrorRef = React.useRef<string>();
  const abortControllerRef = React.useRef<AbortController>();

  const validateExistingName = async (value: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    if (isDisabled || !value) {
      currentErrorRef.current = undefined;
    }
    try {
      await get(`${resourceType}/${value}`, abortControllerRef.current.signal);
      currentErrorRef.current = getExistsErrMsg(value);
      setError(currentErrorRef.current);
    } catch (e) {
      currentErrorRef.current = undefined;
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
      setError(currentErrorRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return <TextField name={name} isDisabled={isDisabled} {...rest} />;
};

export default NameField;
