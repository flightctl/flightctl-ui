import * as React from 'react';
import { Grid, GridItem, SelectList, SelectOption } from '@patternfly/react-core';
import { TFunction } from 'i18next';

import { useTranslation } from '../../../hooks/useTranslation';
import FilterSelect, { FilterSelectGroup } from '../../form/FilterSelect';
import { fuzzySeach } from '../../../utils/search';
import { FilterOptionsFC, FilterStatusMap, UpdateStatus } from './types';
import StatusDisplay from '../../Status/StatusDisplay';
import { DeviceSummaryStatus, FilterSearchParams, getDeviceStatusItems } from '../../../utils/status/devices';
import { StatusItem } from '../../../utils/status/common';
import { getApplicationSummaryStatusItems } from '../../../utils/status/applications';
import { getSystemUpdateStatusItems } from '../../../utils/status/system';

export const getStatusItem = (
  t: TFunction,
  key: keyof FilterStatusMap,
): {
  title: string;
  items: StatusItem<DeviceSummaryStatus>[];
} => {
  switch (key) {
    case FilterSearchParams.AppStatus:
      return {
        title: t('Application status'),
        items: getApplicationSummaryStatusItems(t),
      };
    case FilterSearchParams.DeviceStatus:
      return {
        title: t('Device status'),
        items: getDeviceStatusItems(t),
      };
    default:
      return {
        title: t('System update status'),
        items: getSystemUpdateStatusItems(t),
      };
  }
};

const FilterOption: FilterOptionsFC = ({ items, selectedFilters, onClick, filter }) => {
  const { t } = useTranslation();
  const filteredItems = items.filter((statusItem) => fuzzySeach(filter, statusItem.label));
  if (!filteredItems.length) {
    return (
      <SelectOption key="no-option" isDisabled>
        {t('No status available')}
      </SelectOption>
    );
  }
  return filteredItems.map((statusItem) => (
    <SelectOption
      onClick={() => onClick(statusItem.id)}
      key={statusItem.id}
      hasCheckbox
      value={statusItem.id}
      isSelected={selectedFilters.includes(statusItem.id)}
    >
      <StatusDisplay item={statusItem} />
    </SelectOption>
  ));
};

type DeviceStatusFilterProps = {
  activeStatuses: FilterStatusMap;
  updateStatus: UpdateStatus;
  isFilterUpdating: boolean;
};

const DeviceStatusFilter = ({ activeStatuses, updateStatus, isFilterUpdating }: DeviceStatusFilterProps) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState('');

  const selectedFilters = Object.values(activeStatuses).reduce((acc, curr) => {
    acc += curr.length;
    return acc;
  }, 0);

  return (
    <FilterSelect
      selectedFilters={selectedFilters}
      placeholder={t('Filter by status')}
      filter={filter}
      setFilter={setFilter}
      isFilterUpdating={isFilterUpdating}
    >
      <SelectList>
        <Grid hasGutter>
          {Object.keys(activeStatuses).map((k) => {
            const key = k as keyof FilterStatusMap;
            const { title, items } = getStatusItem(t, key);
            return (
              <GridItem key={key} span={4}>
                <FilterSelectGroup label={title}>
                  <FilterOption
                    filter={filter}
                    items={items}
                    selectedFilters={activeStatuses[key]}
                    onClick={(value) => updateStatus(key, value)}
                  />
                </FilterSelectGroup>
              </GridItem>
            );
          })}
        </Grid>
      </SelectList>
    </FilterSelect>
  );
};

export default DeviceStatusFilter;
