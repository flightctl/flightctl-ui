import { SearchInput, SearchInputProps } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export type TableTextSearchProps = Omit<SearchInputProps, 'onChange' | 'aria-label'> & {
  setValue: (val: string) => void;
  onClear?: VoidFunction;
};

const TableTextSearch: React.FC<TableTextSearchProps> = ({ value, setValue, placeholder, onClear, ...rest }) => {
  const { t } = useTranslation();
  return (
    <SearchInput
      aria-label={placeholder || t('Search by name')}
      onChange={(_event, value) => (value === '' && onClear ? onClear() : setValue(value))}
      value={value}
      placeholder={placeholder || t('Search by name')}
      onClear={() => (onClear ? onClear() : setValue(''))}
      {...rest}
    />
  );
};

export default TableTextSearch;
