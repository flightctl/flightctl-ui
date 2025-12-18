import * as React from 'react';
import {
	Label, LabelGroup, Button,
	Split,
	SplitItem,
	Toolbar,
	ToolbarContent,
	ToolbarGroup,
	ToolbarItem
} from '@patternfly/react-core';


import { TableTextSearchProps } from '../../Table/TableTextSearch';
import { useTranslation } from '../../../hooks/useTranslation';
import DeviceStatusFilter, { getStatusItem } from './DeviceFilterSelect';
import { FilterStatusMap, UpdateStatus } from './types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { labelToString } from '../../../utils/labels';
import DeviceTableToolbarFilters from './DeviceToolbarFilters';

type DeviceTableToolbarProps = {
  nameOrAlias: TableTextSearchProps['value'];
  setNameOrAlias: TableTextSearchProps['setValue'];
  ownerFleets: string[];
  setOwnerFleets: (ownerFleets: string[]) => void;
  activeStatuses: FilterStatusMap;
  setActiveStatuses: (statuses: FilterStatusMap) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  isFilterUpdating: boolean;
};

const DeviceTableToolbar: React.FC<React.PropsWithChildren<DeviceTableToolbarProps>> = ({ children, ...rest }) => {
  const {
    ownerFleets,
    setOwnerFleets,
    nameOrAlias,
    setNameOrAlias,
    activeStatuses,
    setActiveStatuses,
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
            <ToolbarItem >
              <DeviceStatusFilter
                activeStatuses={activeStatuses}
                updateStatus={updateStatus}
                isFilterUpdating={isFilterUpdating}
              />
            </ToolbarItem>
            <ToolbarItem >
              <DeviceTableToolbarFilters
                selectedLabels={selectedLabels}
                selectedFleetNames={ownerFleets}
                setSelectedLabels={setSelectedLabels}
                setSelectedFleets={setOwnerFleets}
                nameOrAlias={nameOrAlias}
                setNameOrAlias={setNameOrAlias}
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
  nameOrAlias,
  setNameOrAlias,
  ownerFleets,
  setOwnerFleets,
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
              <Label variant="outline" key={fleetId} onClose={() => setOwnerFleets(ownerFleets.filter((f) => f !== fleetId))}>
                {fleetId}
              </Label>
            ))}
          </LabelGroup>
        </SplitItem>
      )}
      {nameOrAlias && (
        <SplitItem>
          <LabelGroup categoryName={t('Name / Alias')} isClosable onClick={() => setNameOrAlias('')}>
            <Label variant="outline" onClose={() => setNameOrAlias('')}>{nameOrAlias}</Label>
          </LabelGroup>
        </SplitItem>
      )}
      {!!selectedLabels.length && (
        <SplitItem>
          <LabelGroup categoryName={t('Labels')} isClosable onClick={() => setSelectedLabels([])}>
            {selectedLabels.map((label) => {
              const labelStr = labelToString(label);
              return (
                <Label variant="outline"
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
      {(!!statusKeys.length || !!ownerFleets.length || !!nameOrAlias || !!selectedLabels.length) && (
        <SplitItem>
          <Button
            variant="link"
            onClick={() => {
              updateStatus();
              setOwnerFleets([]);
              setNameOrAlias('');
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
