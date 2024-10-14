import * as React from 'react';
import {
  Button,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Fleet } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { labelToString } from '../../../../utils/labels';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import DeviceTableToolbarFilters from '../../../Device/DevicesPage/DeviceToolbarFilters';

type StatusCardFiltersProps = {
  fleets: Fleet[];
  selectedFleets: string[];
  setSelectedFleets: (fleets: string[]) => void;
  allLabels: FlightCtlLabel[];
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
};

const StatusCardFilters: React.FC<StatusCardFiltersProps> = ({
  fleets,
  selectedFleets,
  setSelectedFleets,
  allLabels,
  selectedLabels,
  setSelectedLabels,
}) => {
  const { t } = useTranslation();

  const hasFilters = selectedFleets.length + selectedLabels.length > 0;

  return (
    <Flex>
      <FlexItem>
        <Toolbar id="overview-toolbar" inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem variant="search-filter">
                <DeviceTableToolbarFilters
                  fleets={fleets}
                  selectedFleetNames={selectedFleets}
                  setSelectedFleets={setSelectedFleets}
                  allLabels={allLabels}
                  selectedLabels={selectedLabels}
                  setSelectedLabels={setSelectedLabels}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </FlexItem>

      {hasFilters && (
        <StackItem>
          <Flex>
            {!!selectedFleets.length && (
              <FlexItem>
                <ChipGroup categoryName={t('Fleets')} isClosable onClick={() => setSelectedFleets([])}>
                  {selectedFleets.map((fleet) => (
                    <Chip key={fleet} onClick={() => setSelectedFleets(selectedFleets.filter((f) => f !== fleet))}>
                      {fleet}
                    </Chip>
                  ))}
                </ChipGroup>
              </FlexItem>
            )}
            {!!selectedLabels.length && (
              <FlexItem>
                <ChipGroup categoryName={t('Labels')} isClosable onClick={() => setSelectedLabels([])}>
                  {selectedLabels.map((l) => {
                    const label = labelToString(l);
                    return (
                      <Chip
                        key={label}
                        onClick={() => setSelectedLabels(selectedLabels.filter((l) => labelToString(l) !== label))}
                      >
                        {label}
                      </Chip>
                    );
                  })}
                </ChipGroup>
              </FlexItem>
            )}
            <FlexItem>
              <Button
                variant="link"
                onClick={() => {
                  setSelectedLabels([]);
                  setSelectedFleets([]);
                }}
              >
                {t('Clear all filters')}
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      )}
    </Flex>
  );
};

export default StatusCardFilters;
