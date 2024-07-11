import * as React from 'react';
import {
  Button,
  Chip,
  ChipGroup,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import TableTextSearch, { TableTextSearchProps } from '../../Table/TableTextSearch';
import { useTranslation } from '../../../hooks/useTranslation';
import DeviceFilterSelect, { getStatusItem } from './DeviceFilterSelect';
import { FilterStatusMap, UpdateStatus } from './types';
import { DeviceLikeResource, FlightCtlLabel } from '../../../types/extraTypes';
import { labelToString } from '../../../utils/labels';
import { Fleet } from '@flightctl/types';

type DeviceTableToolbarProps = {
  resources: DeviceLikeResource[];
  search: TableTextSearchProps['value'];
  setSearch: TableTextSearchProps['setValue'];
  fleetId: string | undefined;
  setFleetId: (fleetId: string) => void;
  activeStatuses: FilterStatusMap;
  setActiveStatuses: (statuses: FilterStatusMap) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  fleets: Fleet[];
};

const DeviceTableToolbar: React.FC<React.PropsWithChildren<DeviceTableToolbarProps>> = ({ children, ...rest }) => {
  const { t } = useTranslation();
  const {
    resources,
    fleetId,
    setFleetId,
    search,
    setSearch,
    activeStatuses,
    setActiveStatuses,
    selectedLabels,
    setSelectedLabels,
    fleets,
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
            <ToolbarItem variant="search-filter">
              <DeviceFilterSelect
                resources={resources}
                selectedLabels={selectedLabels}
                setSelectedLabels={setSelectedLabels}
                selectedFleets={fleetId ? [fleetId] : []}
                setSelectedFleets={(fleets) => setFleetId(fleets[0])}
                activeStatuses={activeStatuses}
                updateStatus={updateStatus}
                fleets={fleets}
              />
            </ToolbarItem>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={search} setValue={setSearch} placeholder={t('Search by name or fingerprint')} />
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
  fleetId,
  search,
  setFleetId,
  setSearch,
  selectedLabels,
  setSelectedLabels,
}: DeviceToolbarChipsProps) => {
  const { t } = useTranslation();
  const statusKeys = Object.keys(activeStatuses).filter((k) => !!activeStatuses[k as keyof FilterStatusMap].length);
  return (
    <Split hasGutter>
      {statusKeys.map((k) => {
        const key = k as keyof FilterStatusMap;
        const { title, items } = getStatusItem(t, key);
        return (
          <SplitItem key={key}>
            <ChipGroup categoryName={title} isClosable onClick={() => updateStatus(key)}>
              {activeStatuses[key].map((status: string) => (
                <Chip key={status} onClick={() => updateStatus(key, status)}>
                  {items.find(({ id }) => id === status)?.label}
                </Chip>
              ))}
            </ChipGroup>
          </SplitItem>
        );
      })}
      {fleetId && (
        <SplitItem>
          <ChipGroup categoryName={t('Fleet')} isClosable onClick={() => setFleetId('')}>
            <Chip onClick={() => setFleetId('')}>{fleetId}</Chip>
          </ChipGroup>
        </SplitItem>
      )}
      {search && (
        <SplitItem>
          <ChipGroup categoryName={t('Name / ID')} isClosable onClick={() => setSearch('')}>
            <Chip onClick={() => setSearch('')}>{search}</Chip>
          </ChipGroup>
        </SplitItem>
      )}
      {!!selectedLabels.length && (
        <SplitItem>
          <ChipGroup categoryName={t('Labels')} isClosable onClick={() => setSelectedLabels([])}>
            {selectedLabels.map((label) => {
              const labelStr = labelToString(label);
              return (
                <Chip
                  key={labelStr}
                  onClick={() => setSelectedLabels(selectedLabels.filter((l) => labelToString(l) !== labelStr))}
                >
                  {labelStr}
                </Chip>
              );
            })}
          </ChipGroup>
        </SplitItem>
      )}
      {(!!statusKeys.length || !!fleetId || !!search || !!selectedLabels.length) && (
        <SplitItem>
          <Button
            variant="link"
            onClick={() => {
              updateStatus();
              setFleetId('');
              setSearch('');
              setSelectedLabels([]);
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
