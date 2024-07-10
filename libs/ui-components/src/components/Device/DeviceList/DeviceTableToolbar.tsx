import * as React from 'react';
import {
  Chip,
  ChipGroup,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import debounce from 'lodash/debounce';

import TableTextSearch, { TableTextSearchProps } from '../../Table/TableTextSearch';
import { useTranslation } from '../../../hooks/useTranslation';
import DeviceStatusFilterSelect, { getStatusItem } from './DeviceStatusFilterSelect';
import { FilterStatusMap, UpdateStatus } from './types';

type DeviceTableToolbarProps = {
  search: TableTextSearchProps['value'];
  setSearch: TableTextSearchProps['setValue'];
  fleetId: string | undefined;
  setFleetId: (fleetId: string) => void;
  activeStatuses: FilterStatusMap;
  setActiveStatuses: (statuses: FilterStatusMap) => void;
};

const DeviceTableToolbar: React.FC<React.PropsWithChildren<DeviceTableToolbarProps>> = ({ children, ...rest }) => {
  const { t } = useTranslation();
  const { fleetId, setFleetId, search, setSearch, activeStatuses, setActiveStatuses } = rest;

  const updateStatus: UpdateStatus = (statusType, status) => {
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
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFleet = React.useCallback(debounce(setFleetId, 1000), []);

  return (
    <>
      <Toolbar id="devices-toolbar" inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <DeviceStatusFilterSelect activeStatuses={activeStatuses} updateStatus={updateStatus} />
            </ToolbarItem>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={search} setValue={setSearch} placeholder={t('Search by name or fingerprint')} />
            </ToolbarItem>
            <ToolbarItem variant="search-filter">
              <TableTextSearch
                value={fleetId}
                setValue={updateFleet}
                onClear={() => setFleetId('')}
                placeholder={t('Fleet name (exact match)')}
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
  fleetId,
  search,
  setFleetId,
  setSearch,
}: DeviceToolbarChipsProps) => {
  const { t } = useTranslation();
  return (
    <Split hasGutter>
      {Object.keys(activeStatuses)
        .filter((k) => !!activeStatuses[k as keyof FilterStatusMap].length)
        .map((k) => {
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
    </Split>
  );
};

export default DeviceTableToolbar;
