import * as React from 'react';
import debounce from 'lodash/debounce';

import { DeviceTextFilterKey, FilterSearchParams } from '../../../utils/status/devices';
import TableTextSearch from '../../Table/TableTextSearch';

import './DeviceToolbarFilters.css';

type DeviceNameOnlyToolbarFilterProps = {
  setTextFilter: (key: DeviceTextFilterKey, value: string) => void;
};

const DeviceNameOnlyToolbarFilter = ({ setTextFilter }: DeviceNameOnlyToolbarFilterProps) => {
  const [typingText, setTypingText] = React.useState<string>('');
  const debouncedSetNameOrAlias = React.useMemo(
    () =>
      debounce((value: string) => {
        setTextFilter?.(FilterSearchParams.NameOrAlias, value || '');
      }, 500),
    [setTextFilter],
  );

  React.useEffect(() => {
    debouncedSetNameOrAlias(typingText);
  }, [typingText, debouncedSetNameOrAlias]);

  return <TableTextSearch value={typingText} setValue={setTypingText} />;
};

export default DeviceNameOnlyToolbarFilter;
