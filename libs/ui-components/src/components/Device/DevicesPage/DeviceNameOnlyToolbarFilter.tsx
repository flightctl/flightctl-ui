import * as React from 'react';
import debounce from 'lodash/debounce';

import TableTextSearch, { TableTextSearchProps } from '../../Table/TableTextSearch';

import './DeviceToolbarFilters.css';

type DeviceNameOnlyToolbarFilterProps = {
  nameOrAlias?: TableTextSearchProps['value'];
  setNameOrAlias: TableTextSearchProps['setValue'];
};

const DeviceNameOnlyToolbarFilter = ({ setNameOrAlias }: DeviceNameOnlyToolbarFilterProps) => {
  const [typingText, setTypingText] = React.useState<string>('');
  const debouncedSetParam = React.useMemo(
    () =>
      debounce((setValue: TableTextSearchProps['setValue'], value: string) => {
        setValue(value || '');
      }, 500),
    [],
  );

  React.useEffect(() => {
    debouncedSetParam(setNameOrAlias, typingText);
  }, [typingText, setNameOrAlias, debouncedSetParam]);

  return <TableTextSearch value={typingText} setValue={setTypingText} />;
};

export default DeviceNameOnlyToolbarFilter;
