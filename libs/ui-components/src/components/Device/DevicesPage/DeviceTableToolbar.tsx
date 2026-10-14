import * as React from 'react';
import {
  Button,
  Label,
  LabelGroup,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import {
  DEVICE_TEXT_FILTER_KEYS,
  type DeviceFeatureFilter,
  type DeviceTextFilterKey,
  getDeviceFeatureFilterLabel,
  getDeviceFilterLabel,
  toggleFeatureFilterValue,
} from '../../../utils/status/devices';
import { labelToString } from '../../../utils/labels';
import DeviceStatusFilter, { getStatusItem } from './DeviceFilterSelect';
import type { FilterStatusMap, UpdateStatus } from './types';
import type { FlightCtlLabel } from '../../../types/extraTypes';
import DeviceTableToolbarFilters from './DeviceToolbarFilters';
import DeviceFeatureFilters from './DeviceFeatureFilters';

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
  selectedFeatures: DeviceFeatureFilter[];
  selectedFeaturesCount: number;
  setSelectedFeatures: (filters: DeviceFeatureFilter[]) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  isFilterUpdating: boolean;
};

const DeviceTableToolbar: React.FC<React.PropsWithChildren<DeviceTableToolbarProps>> = ({ children, ...rest }) => {
  const {
    ownerFleets,
    setOwnerFleets,
    textFilters,
    setTextFilter,
    activeStatuses,
    setActiveStatuses,
    selectedFeatures,
    selectedFeaturesCount,
    setSelectedFeatures,
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
              <DeviceFeatureFilters
                selectedFeatures={selectedFeatures}
                selectedFeaturesCount={selectedFeaturesCount}
                setSelectedFeatures={setSelectedFeatures}
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
  selectedFeatures,
  selectedFeaturesCount,
  setSelectedFeatures,
  selectedLabels,
  setSelectedLabels,
}: DeviceToolbarChipsProps) => {
  const { t } = useTranslation();
  const statusKeys = Object.keys(activeStatuses).filter((k) => !!activeStatuses[k as keyof FilterStatusMap].length);
  const activeTextFilterKeys = DEVICE_TEXT_FILTER_KEYS.filter((key) => !!textFilters[key]);

  const featureChips = selectedFeatures.flatMap((feature) =>
    feature.values.map((value) => ({ featureId: feature.fieldId, value })),
  );

  const hasAnyFilter =
    !!statusKeys.length ||
    !!ownerFleets.length ||
    onlyFleetless ||
    !!activeTextFilterKeys.length ||
    !!selectedLabels.length ||
    selectedFeaturesCount > 0;

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
      {featureChips.length > 0 && (
        <SplitItem>
          <LabelGroup categoryName={t('Device requirements')} isClosable onClick={() => setSelectedFeatures([])}>
            {featureChips.map(({ featureId, value }) => (
              <Label
                variant="outline"
                key={`${featureId}-${value}`}
                onClose={() => setSelectedFeatures(toggleFeatureFilterValue(selectedFeatures, featureId, value))}
              >
                {getDeviceFeatureFilterLabel(t, featureId, value)}
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
              setSelectedFeatures([]);
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
