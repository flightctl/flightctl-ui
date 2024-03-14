import { SearchInput, SearchInputProps } from '@patternfly/react-core';
import * as React from 'react';

export type TableTextSearchProps = Omit<SearchInputProps, 'onClear' | 'onChange' | 'aria-label'> & {
  setValue: (val: string) => void;
};

const TableTextSearch: React.FC<TableTextSearchProps> = ({
  value,
  setValue,
  placeholder = 'Search by name',
  ...rest
}) => {
  return (
    <SearchInput
      aria-label={placeholder}
      onChange={(_event, value) => setValue(value)}
      value={value}
      onClear={() => {
        setValue('');
      }}
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default TableTextSearch;
