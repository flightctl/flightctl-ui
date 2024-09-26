import * as React from 'react';

import { SearchInput, SearchInputProps } from '@patternfly/react-core';

export type TableTextSearchProps = Omit<SearchInputProps, 'onChange' | 'aria-label'> & {
  setValue: (val: string) => void;
  onClear?: VoidFunction;
};

const TableTextSearch: React.FC<TableTextSearchProps> = ({ value, setValue, placeholder, onClear, ...rest }) => {
  return (
    <SearchInput
      aria-label={placeholder}
      onChange={(_event, value) => (value === '' && onClear ? onClear() : setValue(value))}
      value={value}
      placeholder={placeholder}
      onClear={() => (onClear ? onClear() : setValue(''))}
      {...rest}
    />
  );
};

export default TableTextSearch;
