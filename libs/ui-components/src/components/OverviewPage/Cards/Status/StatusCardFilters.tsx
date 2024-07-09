import * as React from 'react';
import {
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';
import { Device, Fleet } from '@flightctl/types';
import fuzzy from 'fuzzysearch';
import { useTranslation } from '../../../../hooks/useTranslation';
import { labelToString } from './utils';

import './StatusCardFilters.css';

const fuzzySeach = (filter: string | undefined, value: string): boolean => {
  if (!filter) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return fuzzy(filter, value) as boolean;
};

type StatusCardFiltersProps = {
  fleets: Fleet[];
  devices: Device[];
  selectedFleets: string[];
  setSelectedFleets: (fleets: string[]) => void;
  selectedLabels: { key: string; value: string }[];
  setSelectedLabels: (labels: { key: string; value: string }[]) => void;
};

const StatusCardFilters: React.FC<StatusCardFiltersProps> = ({
  fleets,
  devices,
  selectedFleets,
  setSelectedFleets,
  selectedLabels,
  setSelectedLabels,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [filter, setFilter] = React.useState<string>();

  const filteredLabels = [
    ...new Set([
      ...devices.reduce((acc, curr) => {
        const deviceLabels = curr.metadata.labels || {};
        Object.keys(deviceLabels).forEach((k) => {
          acc.push(deviceLabels[k] ? `${k}=${deviceLabels[k]}` : k);
        });
        return acc;
      }, [] as string[]),
      ...selectedLabels.map(labelToString),
    ]),
  ]
    .sort()
    .filter((label) => fuzzySeach(filter, label));

  const filteredFleets = fleets.map((f) => f.metadata.name || '').filter((f) => fuzzySeach(filter, f));

  return (
    <Flex>
      <FlexItem>
        <Select
          aria-label={t('Filters')}
          role="menu"
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              variant="typeahead"
              aria-label="Filters"
              onClick={() => setIsExpanded(!isExpanded)}
              isExpanded={isExpanded}
              isFullWidth
            >
              <TextInputGroup isPlain>
                <TextInputGroupMain
                  value={filter}
                  onClick={() => setIsExpanded(!isExpanded)}
                  onChange={(_, value) => setFilter(value)}
                  onKeyDown={() => !isExpanded && setIsExpanded(true)}
                  autoComplete="off"
                  placeholder="Filter by fleets or labels"
                  role="combobox"
                  isExpanded={isExpanded}
                />
              </TextInputGroup>
            </MenuToggle>
          )}
          isOpen={isExpanded}
          onOpenChange={setIsExpanded}
        >
          <SelectList>
            <Split hasGutter>
              <SplitItem>
                <SelectGroup label={t('Fleets')}>
                  <div className="fctl-status-card__filter">
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
                                ? selectedFleets.filter((f) => f !== f)
                                : [...selectedFleets, f],
                            )
                          }
                        >
                          {f}
                        </SelectOption>
                      ))
                    )}
                  </div>
                </SelectGroup>
              </SplitItem>
              <SplitItem>
                <SelectGroup label={t('Labels')}>
                  <div className="fctl-status-card__filter">
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
                  </div>
                </SelectGroup>
              </SplitItem>
            </Split>
          </SelectList>
        </Select>
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
    </Flex>
  );
};

export default StatusCardFilters;
