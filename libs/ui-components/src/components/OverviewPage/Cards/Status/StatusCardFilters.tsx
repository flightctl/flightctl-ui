import * as React from 'react';
import {
  Button,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { Device, Fleet } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import FilterSelect, { FilterSelectGroup } from '../../../form/FilterSelect';
import { filterDevicesLabels, labelToString } from '../../../../utils/labels';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import { fuzzySeach } from '../../../../utils/search';

type StatusCardFiltersProps = {
  fleets: Fleet[];
  devices: Device[];
  selectedFleets: string[];
  setSelectedFleets: (fleets: string[]) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  isFilterUpdating: boolean;
};

const StatusCardFilters: React.FC<StatusCardFiltersProps> = ({
  fleets,
  devices,
  selectedFleets,
  setSelectedFleets,
  selectedLabels,
  setSelectedLabels,
  isFilterUpdating,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState('');

  const filteredLabels = filterDevicesLabels(devices, selectedLabels, filter);
  const filteredFleets = fleets.map((f) => f.metadata.name || '').filter((f) => fuzzySeach(filter, f));

  const selectedFilters = selectedFleets.length + selectedLabels.length;

  return (
    <Flex>
      <FlexItem>
        <FilterSelect
          selectedFilters={selectedFilters}
          placeholder={t('Filter by fleets or labels')}
          filter={filter}
          setFilter={setFilter}
          isFilterUpdating={isFilterUpdating}
        >
          <SelectList>
            <Grid hasGutter>
              <GridItem span={6}>
                <FilterSelectGroup label={t('Fleets')}>
                  {!filteredFleets.length ? (
                    <SelectOption isDisabled>{t('No fleets available')}</SelectOption>
                  ) : (
                    filteredFleets.map((f) => (
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
              <GridItem span={6}>
                <FilterSelectGroup label={t('Labels')}>
                  {!filteredLabels.length ? (
                    <SelectOption isDisabled>{t('No labels available')}</SelectOption>
                  ) : (
                    filteredLabels.map((label) => (
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
                            const labelParts = label.split('=');
                            let labelObj: { key: string; value: string };
                            if (labelParts.length === 1) {
                              labelObj = {
                                key: labelParts[0],
                                value: '',
                              };
                            } else {
                              labelObj = {
                                key: labelParts[0],
                                value: labelParts[1],
                              };
                            }
                            setSelectedLabels([...selectedLabels, labelObj]);
                          }
                        }}
                      >
                        <Label id={label}>{label}</Label>
                      </SelectOption>
                    ))
                  )}
                </FilterSelectGroup>
              </GridItem>
            </Grid>
          </SelectList>
        </FilterSelect>
      </FlexItem>
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
      {(!!selectedFleets.length || !!selectedLabels.length) && (
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
      )}
    </Flex>
  );
};

export default StatusCardFilters;
