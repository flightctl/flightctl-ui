import * as React from 'react';
import { HelperText, HelperTextItem, SearchInput, SearchInputProps, Stack, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

export type TableTextSearchProps = Omit<SearchInputProps, 'onChange' | 'onClear' | 'aria-label'> & {
  setValue: (val: string) => void;
};

const TableTextSearch: React.FC<TableTextSearchProps> = ({ value, setValue, placeholder, ...rest }) => {
  const { t } = useTranslation();
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [actualValue, setActualValue] = React.useState<string>(value || '');

  React.useEffect(() => {
    // When the value is cleared externally, reset the component state
    if (value === '') {
      setActualValue('');
      setHasError(false);
    }
  }, [value]);

  const handleClear = React.useCallback(() => {
    setActualValue('');
    setValue('');
    setHasError(false);
  }, [setValue]);

  const handleChange = React.useCallback(
    (_event: React.FormEvent<HTMLInputElement>, newValue: string) => {
      setActualValue(newValue);

      if (newValue === '') {
        handleClear();
      } else {
        const stripped = newValue.replace(/\s/g, '');
        if (stripped === newValue) {
          setValue(stripped);
          setHasError(false);
        } else {
          setHasError(true);
        }
      }
    },
    [handleClear, setValue],
  );

  return (
    <Stack>
      <StackItem>
        <SearchInput
          aria-label={placeholder}
          onChange={handleChange}
          value={actualValue}
          placeholder={placeholder}
          onClear={handleClear}
          {...rest}
        />
      </StackItem>
      {hasError && (
        <StackItem className="pf-v6-u-mt-sm">
          <HelperText>
            <HelperTextItem variant="error">{t('Search value cannot contain spaces')}</HelperTextItem>
          </HelperText>
        </StackItem>
      )}
    </Stack>
  );
};

export default TableTextSearch;
