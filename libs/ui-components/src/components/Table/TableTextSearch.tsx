import { SearchInput, SearchInputProps } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export type TableTextSearchProps = Omit<SearchInputProps, 'onClear' | 'onChange' | 'aria-label'> & {
  setValue: (val: string) => void;
};

const TableTextSearch: React.FC<TableTextSearchProps> = ({ value, setValue, placeholder, ...rest }) => {
  const { t } = useTranslation();
  return (
    <SearchInput
      aria-label={placeholder || t('Search by name')}
      onChange={(_event, value) => setValue(value)}
      value={value}
      onClear={() => {
        setValue('');
      }}
      placeholder={placeholder || t('Search by name')}
      {...rest}
    />
  );
};

export default TableTextSearch;
