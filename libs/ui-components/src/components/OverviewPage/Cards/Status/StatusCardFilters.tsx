import * as React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';
import { labelToString } from '../../../../utils/labels';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import DeviceTableToolbarFilters from '../../../Device/DevicesPage/DeviceToolbarFilters';

type StatusCardFiltersProps = {
  selectedFleets: string[];
  setSelectedFleets: (fleets: string[]) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
};

const StatusCardFilters: React.FC<StatusCardFiltersProps> = ({
  selectedFleets,
  setSelectedFleets,
  selectedLabels,
  setSelectedLabels,
}) => {
  const { t } = useTranslation();

  const hasFilters = selectedFleets.length + selectedLabels.length > 0;

  return (
    <Flex alignItems={{ default: 'alignItemsFlexEnd' }}>
      <FlexItem>
        <Toolbar id="overview-toolbar" inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <DeviceTableToolbarFilters
                  selectedFleetNames={selectedFleets}
                  setSelectedFleets={setSelectedFleets}
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
                <LabelGroup categoryName={t('Fleets')} isClosable onClick={() => setSelectedFleets([])}>
                  {selectedFleets.map((fleet) => (
                    <Label
                      variant="outline"
                      key={fleet}
                      onClose={() => setSelectedFleets(selectedFleets.filter((f) => f !== fleet))}
                    >
                      {fleet}
                    </Label>
                  ))}
                </LabelGroup>
              </FlexItem>
            )}
            {!!selectedLabels.length && (
              <FlexItem>
                <LabelGroup categoryName={t('Labels')} isClosable onClick={() => setSelectedLabels([])}>
                  {selectedLabels.map((l) => {
                    const label = labelToString(l);
                    return (
                      <Label
                        variant="outline"
                        key={label}
                        onClose={() => setSelectedLabels(selectedLabels.filter((l) => labelToString(l) !== label))}
                      >
                        {label}
                      </Label>
                    );
                  })}
                </LabelGroup>
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
