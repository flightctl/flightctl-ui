import { Grid, GridItem, Label, SelectList, SelectOption } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import FilterSelect, { FilterSelectGroup } from '../../form/FilterSelect';
import { DeviceLikeResource, FlightCtlLabel } from '../../../types/extraTypes';
import { filterDevicesLabels, labelToString, stringToLabel } from '../../../utils/labels';
import { fuzzySeach } from '../../../utils/search';
import { FilterOptionsFC, FilterStatusMap, UpdateStatus } from './types';
import StatusDisplay from '../../Status/StatusDisplay';
import { TFunction } from 'i18next';
import { DeviceSummaryStatus, FilterSearchParams, getDeviceStatusItems } from '../../../utils/status/devices';
import { StatusItem } from '../../../utils/status/common';
import { getApplicationSummaryStatusItems } from '../../../utils/status/applications';
import { getSystemUpdateStatusItems } from '../../../utils/status/system';
import { Fleet } from '@flightctl/types';

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

type DeviceFilterSelectProps = {
  resources: DeviceLikeResource[];
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  selectedFleets: string[];
  setSelectedFleets: (fleets: string[]) => void;
  activeStatuses: FilterStatusMap;
  updateStatus: UpdateStatus;
  fleets: Fleet[];
  isFilterUpdating: boolean;
};

const DeviceFilterSelect: React.FC<DeviceFilterSelectProps> = ({
  resources,
  selectedFleets,
  selectedLabels,
  setSelectedLabels,
  setSelectedFleets,
  activeStatuses,
  updateStatus,
  fleets,
  isFilterUpdating,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState('');

  const availableFleets = [
    ...new Set([
      ...fleets.filter((f) => fuzzySeach(filter, f.metadata.name)).map((f) => f.metadata.name || ''),
      ...selectedFleets,
    ]),
  ];

  const filteredLabels = filterDevicesLabels(resources, selectedLabels, filter);

  const selectedFilters = Object.values(activeStatuses).reduce((acc, curr) => {
    acc += curr.length;
    return acc;
  }, selectedFleets.length + selectedLabels.length);

  return (
    <FilterSelect
      selectedFilters={selectedFilters}
      placeholder={t('Filter by status, fleets or labels')}
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
              <GridItem key={key} span={2}>
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
          <GridItem span={3}>
            <FilterSelectGroup label={t('Fleets')}>
              {!availableFleets.length ? (
                <SelectOption isDisabled>{t('No fleets available')}</SelectOption>
              ) : (
                availableFleets.map((f) => (
                  <SelectOption
                    key={f}
                    hasCheckbox
                    value={f}
                    isSelected={selectedFleets.includes(f)}
                    onClick={() =>
                      setSelectedFleets(
                        selectedFleets.includes(f)
                          ? selectedFleets.filter((fleet) => fleet !== f)
                          : [...selectedFleets, f],
                      )
                    }
                  >
                    {f}
                  </SelectOption>
                ))
              )}
            </FilterSelectGroup>
          </GridItem>
          <GridItem span={3}>
            <FilterSelectGroup label={t('Labels')}>
              {!filteredLabels.length ? (
                <SelectOption isDisabled>{t('No labels available')}</SelectOption>
              ) : (
                filteredLabels.map((label) => {
                  return (
                    <SelectOption
                      key={label}
                      hasCheckbox
                      value={label}
                      isSelected={selectedLabels.some((l) => labelToString(l) === label)}
                      onClick={() => {
                        const newLabels = selectedLabels.filter((l) => labelToString(l) !== label);
                        if (newLabels.length !== selectedLabels.length) {
                          setSelectedLabels(newLabels);
                        } else {
                          setSelectedLabels([...selectedLabels, stringToLabel(label)]);
                        }
                      }}
                    >
                      <Label id={label}>{label}</Label>
                    </SelectOption>
                  );
                })
              )}
            </FilterSelectGroup>
          </GridItem>
        </Grid>
      </SelectList>
    </FilterSelect>
  );
};

export default DeviceFilterSelect;
