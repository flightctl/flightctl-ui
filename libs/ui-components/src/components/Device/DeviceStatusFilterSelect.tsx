import * as React from 'react';
import { SelectOption } from '@patternfly/react-core';

import { FilterSearchParams, StatusItem, StatusItemType } from '../../utils/status/common';
import StatusDisplay from '../Status/StatusDisplay';

type DeviceStatusFilterSelectProps<T extends StatusItemType> = {
  type: FilterSearchParams;
  items: Array<StatusItem<T>>;
  selectedFilters: Array<string>;
};

const DeviceStatusFilterSelect = <T extends StatusItemType>({
  type,
  items,
  selectedFilters,
}: DeviceStatusFilterSelectProps<T>) => {
  return items.map((statusItem) => {
    const itemKey = `${type}#${statusItem.id}`;
    return (
      <SelectOption key={itemKey} hasCheckbox value={itemKey} isSelected={selectedFilters.includes(itemKey)}>
        <StatusDisplay item={statusItem} />
      </SelectOption>
    );
  });
};

export default DeviceStatusFilterSelect;
