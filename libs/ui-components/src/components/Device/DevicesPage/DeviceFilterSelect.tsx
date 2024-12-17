import * as React from 'react';
import { Grid, GridItem, SelectList, SelectOption } from '@patternfly/react-core';
import { TFunction } from 'i18next';

import { ApplicationsSummaryStatusType, DeviceUpdatedStatusType } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { AllDeviceSummaryStatusType } from '../../../types/extraTypes';
import FilterSelect, { FilterSelectGroup } from '../../form/FilterSelect';
import { FilterStatusMap, UpdateStatus } from './types';
import StatusDisplay from '../../Status/StatusDisplay';
import { FilterSearchParams, getDeviceStatusItems } from '../../../utils/status/devices';
import { StatusItem } from '../../../utils/status/common';
import { getApplicationSummaryStatusItems } from '../../../utils/status/applications';
import { getSystemUpdateStatusItems } from '../../../utils/status/system';

type DeviceSummaryStatus = ApplicationsSummaryStatusType | DeviceUpdatedStatusType | AllDeviceSummaryStatusType;

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

type DeviceStatusFilterProps = {
  activeStatuses: FilterStatusMap;
  updateStatus: UpdateStatus;
  isFilterUpdating: boolean;
};

const DeviceStatusFilter = ({ activeStatuses, updateStatus, isFilterUpdating }: DeviceStatusFilterProps) => {
  const { t } = useTranslation();

  const selectedFilters = Object.values(activeStatuses).reduce((acc, curr) => {
    acc += curr.length;
    return acc;
  }, 0);

  return (
    <FilterSelect
      selectedFilters={selectedFilters}
      placeholder={t('Filter by status')}
      isFilterUpdating={isFilterUpdating}
    >
      <SelectList>
        <Grid hasGutter>
          {Object.keys(activeStatuses).map((k) => {
            const key = k as keyof FilterStatusMap;
            const { title, items } = getStatusItem(t, key);
            const currentItems = activeStatuses[key] as unknown as DeviceSummaryStatus[];
            return (
              <GridItem key={key} span={4}>
                <FilterSelectGroup label={title}>
                  {items.map((statusItem) => (
                    <SelectOption
                      onClick={() => updateStatus(key, statusItem.id)}
                      key={statusItem.id}
                      hasCheckbox
                      value={statusItem.id}
                      isSelected={currentItems.includes(statusItem.id)}
                    >
                      <StatusDisplay item={statusItem} />
                    </SelectOption>
                  ))}
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
