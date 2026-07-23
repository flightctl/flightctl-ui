import * as React from 'react';
import {
  Button,
  Label,
  LabelGroup,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import {
  DEVICE_OS_MODE_FILTER_VALUES,
  DEVICE_TEXT_FILTER_KEYS,
  type DeviceOsModeFilterValue,
  DeviceTextFilterKey,
  getDeviceFilterLabel,
  getOsModeFilterLabel,
} from '../../../utils/status/devices';
import { labelToString } from '../../../utils/labels';
import DeviceStatusFilter, { getStatusItem } from './DeviceFilterSelect';
import type { FilterStatusMap, UpdateStatus } from './types';
import type { FlightCtlLabel } from '../../../types/extraTypes';
import DeviceTableToolbarFilters from './DeviceToolbarFilters';
import FilterSelect from '../../form/FilterSelect';

type DeviceTableToolbarProps = {
  textFilters: Partial<Record<DeviceTextFilterKey, string>>;
  setTextFilter: (key: DeviceTextFilterKey, value: string) => void;
  clearTextFilters: VoidFunction;
  ownerFleets: string[];
  setOwnerFleets: (ownerFleets: string[]) => void;
  onlyFleetless: boolean;
  setOnlyFleetless: (enabled: boolean) => void;
  activeStatuses: FilterStatusMap;
  setActiveStatuses: (statuses: FilterStatusMap) => void;
  selectedOsModes: DeviceOsModeFilterValue[];
  setSelectedOsModes: (modes: DeviceOsModeFilterValue[]) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  isFilterUpdating: boolean;
};

const OsModeFilter = ({
  selectedOsModes,
  setSelectedOsModes,
  isFilterUpdating,
}: {
  selectedOsModes: DeviceOsModeFilterValue[];
  setSelectedOsModes: (modes: DeviceOsModeFilterValue[]) => void;
  isFilterUpdating: boolean;
}) => {
  const { t } = useTranslation();

  const onToggleOsMode = (mode: DeviceOsModeFilterValue) => {
    if (selectedOsModes.includes(mode)) {
      setSelectedOsModes(selectedOsModes.filter((m) => m !== mode));
    } else {
      setSelectedOsModes([...selectedOsModes, mode]);
    }
  };

  return (
    <FilterSelect
      selectedFilters={selectedOsModes.length}
      placeholder={t('OS mode')}
      isFilterUpdating={isFilterUpdating}
    >
      <SelectList>
        {DEVICE_OS_MODE_FILTER_VALUES.map((mode) => (
          <SelectOption
            key={mode}
            hasCheckbox
            value={mode}
            isSelected={selectedOsModes.includes(mode)}
            onClick={() => onToggleOsMode(mode)}
          >
            {getOsModeFilterLabel(t, mode)}
          </SelectOption>
        ))}
      </SelectList>
    </FilterSelect>
  );
};

const DeviceTableToolbar: React.FC<React.PropsWithChildren<DeviceTableToolbarProps>> = ({ children, ...rest }) => {
  const {
    ownerFleets,
    setOwnerFleets,
    textFilters,
    setTextFilter,
    activeStatuses,
    setActiveStatuses,
    selectedOsModes,
    setSelectedOsModes,
    selectedLabels,
    setSelectedLabels,
    isFilterUpdating,
  } = rest;

  const updateStatus: UpdateStatus = (statusType, status) => {
    if (!statusType) {
      setActiveStatuses(
        Object.keys(activeStatuses).reduce((acc, curr) => {
          acc[curr] = [];
          return acc;
        }, {} as FilterStatusMap),
      );
    } else {
      if (!status) {
        setActiveStatuses({ ...activeStatuses, [statusType]: [] });
      } else {
        if (activeStatuses[statusType].find((s) => s === status)) {
          const newStatuses = activeStatuses[statusType].filter((s) => s !== status);
          setActiveStatuses({ ...activeStatuses, [statusType]: newStatuses });
        } else {
          const newValue = [...activeStatuses[statusType], status];
          setActiveStatuses({ ...activeStatuses, [statusType]: newValue });
        }
      }
    }
  };

  return (
    <>
      <Toolbar id="devices-toolbar" inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <DeviceStatusFilter
                activeStatuses={activeStatuses}
                updateStatus={updateStatus}
                isFilterUpdating={isFilterUpdating}
              />
            </ToolbarItem>
            <ToolbarItem>
              <OsModeFilter
                selectedOsModes={selectedOsModes}
                setSelectedOsModes={setSelectedOsModes}
                isFilterUpdating={isFilterUpdating}
              />
            </ToolbarItem>
            <ToolbarItem style={{ alignItems: 'flex-start' }}>
              <DeviceTableToolbarFilters
                selectedLabels={selectedLabels}
                selectedFleetNames={ownerFleets}
                setSelectedLabels={setSelectedLabels}
                setSelectedFleets={setOwnerFleets}
                textFilters={textFilters}
                setTextFilter={setTextFilter}
              />
            </ToolbarItem>
          </ToolbarGroup>
          {children}
        </ToolbarContent>
      </Toolbar>
      <DeviceToolbarChips {...rest} updateStatus={updateStatus} />
    </>
  );
};

type DeviceToolbarChipsProps = Omit<DeviceTableToolbarProps, 'setActiveStatuses'> & {
  updateStatus: UpdateStatus;
};

const DeviceToolbarChips = ({
  activeStatuses,
  updateStatus,
  textFilters,
  setTextFilter,
  clearTextFilters,
  ownerFleets,
  setOwnerFleets,
  onlyFleetless,
  setOnlyFleetless,
  selectedOsModes,
  setSelectedOsModes,
  selectedLabels,
  setSelectedLabels,
}: DeviceToolbarChipsProps) => {
  const { t } = useTranslation();
  const statusKeys = Object.keys(activeStatuses).filter((k) => !!activeStatuses[k as keyof FilterStatusMap].length);
  const activeTextFilterKeys = DEVICE_TEXT_FILTER_KEYS.filter((key) => !!textFilters[key]);

  const hasAnyFilter =
    !!statusKeys.length ||
    !!ownerFleets.length ||
    onlyFleetless ||
    !!activeTextFilterKeys.length ||
    !!selectedLabels.length ||
    !!selectedOsModes.length;

  return (
    <Split hasGutter>
      {statusKeys.map((k) => {
        const key = k as keyof FilterStatusMap;
        const { title, items } = getStatusItem(t, key);
        return (
          <SplitItem key={key}>
            <LabelGroup categoryName={title} isClosable onClick={() => updateStatus(key)}>
              {activeStatuses[key].map((status: string) => (
                <Label variant="outline" key={status} onClose={() => updateStatus(key, status)}>
                  {items.find(({ id }) => id === status)?.label}
                </Label>
              ))}
            </LabelGroup>
          </SplitItem>
        );
      })}
      {!!ownerFleets.length && (
        <SplitItem>
          <LabelGroup categoryName={t('Fleet')} isClosable onClick={() => setOwnerFleets([])}>
            {ownerFleets.map((fleetId) => (
              <Label
                variant="outline"
                key={fleetId}
                onClose={() => setOwnerFleets(ownerFleets.filter((f) => f !== fleetId))}
              >
                {fleetId}
              </Label>
            ))}
          </LabelGroup>
        </SplitItem>
      )}
      {onlyFleetless && (
        <SplitItem>
          <LabelGroup categoryName={t('Fleet')} isClosable onClick={() => setOnlyFleetless(false)}>
            <Label variant="outline" onClose={() => setOnlyFleetless(false)}>
              {t('N/A')}
            </Label>
          </LabelGroup>
        </SplitItem>
      )}
      {activeTextFilterKeys.map((filterKey) => {
        const value = textFilters[filterKey];
        return (
          <SplitItem key={filterKey}>
            <LabelGroup
              categoryName={getDeviceFilterLabel(t, filterKey)}
              isClosable
              onClick={() => setTextFilter(filterKey, '')}
            >
              <Label variant="outline" onClose={() => setTextFilter(filterKey, '')}>
                {value}
              </Label>
            </LabelGroup>
          </SplitItem>
        );
      })}
      {!!selectedLabels.length && (
        <SplitItem>
          <LabelGroup categoryName={t('Labels')} isClosable onClick={() => setSelectedLabels([])}>
            {selectedLabels.map((label) => {
              const labelStr = labelToString(label);
              return (
                <Label
                  variant="outline"
                  key={labelStr}
                  onClose={() => setSelectedLabels(selectedLabels.filter((l) => labelToString(l) !== labelStr))}
                >
                  {labelStr}
                </Label>
              );
            })}
          </LabelGroup>
        </SplitItem>
      )}
      {selectedOsModes.length > 0 && (
        <SplitItem>
          <LabelGroup categoryName={t('OS mode')} isClosable onClick={() => setSelectedOsModes([])}>
            {selectedOsModes.map((mode) => (
              <Label
                variant="outline"
                key={mode}
                onClose={() => setSelectedOsModes(selectedOsModes.filter((m) => m !== mode))}
              >
                {getOsModeFilterLabel(t, mode)}
              </Label>
            ))}
          </LabelGroup>
        </SplitItem>
      )}
      {hasAnyFilter && (
        <SplitItem>
          <Button
            variant="link"
            onClick={() => {
              updateStatus();
              setOwnerFleets([]);
              setOnlyFleetless(false);
              clearTextFilters();
              setSelectedLabels([]);
              setSelectedOsModes([]);
            }}
          >
            {t('Clear all filters')}
          </Button>
        </SplitItem>
      )}
    </Split>
  );
};

export default DeviceTableToolbar;
