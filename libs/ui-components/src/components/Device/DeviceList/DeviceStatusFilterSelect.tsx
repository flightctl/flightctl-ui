import * as React from 'react';
import {
  Badge,
  MenuToggle,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';

import { StatusItem } from '../../../utils/status/common';
import StatusDisplay from '../../Status/StatusDisplay';
import { useTranslation } from '../../../hooks/useTranslation';
import { FilterOptionsFC, FilterStatusMap, UpdateStatus } from './types';
import { DeviceSummaryStatus, FilterSearchParams, getDeviceStatusItems } from '../../../utils/status/devices';
import { TFunction } from 'i18next';
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

const FilterOption: FilterOptionsFC = ({ items, selectedFilters, onClick }) =>
  items.map((statusItem) => (
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

export const DeviceStatusFilterSelect = ({
  activeStatuses,
  updateStatus,
}: {
  activeStatuses: FilterStatusMap;
  updateStatus: UpdateStatus;
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const filtersSize = Object.values(activeStatuses).reduce((acc, curr) => {
    acc += curr.length;
    return acc;
  }, 0);

  return (
    <Select
      aria-label={t('Filters')}
      role="menu"
      toggle={(toggleRef) => (
        <MenuToggle ref={toggleRef} onClick={() => setIsExpanded(!isExpanded)} isExpanded={isExpanded}>
          <Split hasGutter>
            <SplitItem>{t('Filters')}</SplitItem>
            {filtersSize > 0 && (
              <SplitItem>
                <Badge isRead>{filtersSize}</Badge>
              </SplitItem>
            )}
          </Split>
        </MenuToggle>
      )}
      isOpen={isExpanded}
      onOpenChange={setIsExpanded}
    >
      <SelectList>
        {Object.keys(activeStatuses).map((k) => {
          const key = k as keyof FilterStatusMap;
          const { title, items } = getStatusItem(t, key);
          return (
            <SelectGroup key={key} label={title}>
              <FilterOption
                items={items}
                selectedFilters={activeStatuses[key]}
                onClick={(value) => updateStatus(key, value)}
              />
            </SelectGroup>
          );
        })}
      </SelectList>
    </Select>
  );
};

export default DeviceStatusFilterSelect;
