import * as React from 'react';
import {
  Button,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons/dist/js/icons/times-icon';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';

import { Fleet } from '@flightctl/types';
import { FlightCtlLabel } from '../../../types/extraTypes';

import TableTextSearch, { TableTextSearchProps } from '../../Table/TableTextSearch';
import { useTranslation } from '../../../hooks/useTranslation';
import { fuzzySeach, getSearchResultsCount } from '../../../utils/search';
import { filterDevicesLabels, labelToString } from '../../../utils/labels';

import './DeviceToolbarFilters.css';

const NAME_SEARCH = 'NameAndAlias';
const LABEL_SEARCH = 'LabelsAndFleets';

type LabelFleetSelectorProps = {
  fleets: Fleet[];
  allLabels: FlightCtlLabel[];
  selectedFleetNames: string[];
  selectedLabels: FlightCtlLabel[];
  onSelect: (item: LabelFleetSelectItem) => void;
};

type LabelFleetSelectItem = { type: 'fleet' | 'label'; id: string };

const LabelFleetResults = ({
  allLabels,
  fleets,
  selectedLabels,
  filterText,
}: Omit<LabelFleetSelectorProps, 'onSelect' | 'devices'> & { filterText: string }) => {
  const { t } = useTranslation();

  const availableFleetNames = fleets
    .filter((f) => fuzzySeach(filterText, f.metadata.name))
    .map((f) => f.metadata.name || '');

  const filteredLabels = filterDevicesLabels(allLabels, selectedLabels, filterText);
  const [visibleLabels, visibleFleets] = getSearchResultsCount(filteredLabels.length, availableFleetNames.length);
  if (visibleLabels + visibleFleets === 0) {
    return <div className="fctl-device-toolbar-filters__hint">{t('No results')}</div>;
  }

  return (
    <>
      {visibleLabels > 0 && (
        <SelectGroup label={t('Labels')}>
          <SelectList id="select-typeahead-labels-listbox">
            {filteredLabels
              .filter((_, index) => index < visibleLabels)
              .map((labelStr) => {
                return (
                  <SelectOption key={`label__${labelStr}`} value={{ type: 'label', id: labelStr }}>
                    {labelStr}
                  </SelectOption>
                );
              })}
          </SelectList>
        </SelectGroup>
      )}
      {visibleFleets > 0 && (
        <SelectGroup label={t('Fleets')}>
          <SelectList id="select-typeahead-fleets-listbox">
            {availableFleetNames
              .filter((_, index) => index < visibleFleets)
              .map((fleetName) => (
                <SelectOption key={`fleet__${fleetName}`} value={{ type: 'fleet', id: fleetName }}>
                  {fleetName}
                </SelectOption>
              ))}
          </SelectList>
        </SelectGroup>
      )}
    </>
  );
};

const LabelFleetSelector = ({
  fleets,
  selectedFleetNames,
  allLabels,
  selectedLabels,
  onSelect,
}: LabelFleetSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filterText, setFilterText] = React.useState<string>('');

  const textInputRef = React.useRef<HTMLInputElement>();

  const { t } = useTranslation();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    textInputRef?.current?.focus();
  };

  const onClearButtonClick = () => {
    setFilterText('');
    textInputRef?.current?.focus();
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!filterText) {
      closeMenu();
    }
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setFilterText(value);
  };

  const selectedIds = selectedFleetNames
    .map((fleetName) => ({ type: 'fleet', id: fleetName }))
    .concat(selectedLabels.map((label) => ({ type: 'label', id: labelToString(label) })));

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      className="fctl-device-toolbar-filters__toggle"
      ref={toggleRef}
      variant="typeahead"
      aria-label={t('Fleet and label filter toggle')}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
      icon={
        <Icon size="md" className="fctl-device-toolbar-filters__search-icon">
          <SearchIcon />
        </Icon>
      }
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={filterText}
          onClick={onInputClick}
          onChange={onTextInputChange}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="fleet-label-typeahead-select-listbox"
        />

        <TextInputGroupUtilities {...(!filterText && { style: { display: 'none' } })}>
          <Button variant="plain" onClick={onClearButtonClick} aria-label={t('Clear filter text')}>
            <TimesIcon aria-hidden />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="fleet-label-typeahead-select-listbox"
      isOpen={isOpen}
      selected={selectedIds}
      onSelect={(_event, value) => {
        onSelect(value as unknown as LabelFleetSelectItem);
        setIsOpen(false);
        setFilterText('');
      }}
      onOpenChange={(isOpen) => {
        !isOpen && closeMenu();
      }}
      toggle={toggle}
    >
      <LabelFleetResults
        fleets={fleets}
        filterText={filterText}
        selectedFleetNames={selectedFleetNames}
        allLabels={allLabels}
        selectedLabels={selectedLabels}
      />
    </Select>
  );
};

type DeviceToolbarFilterProps = {
  fleets: Fleet[];
  selectedFleetNames: string[];
  setSelectedFleets: (ownerFleets: string[]) => void;
  allLabels: FlightCtlLabel[];
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  search?: TableTextSearchProps['value'];
  setSearch?: TableTextSearchProps['setValue'];
};

const DeviceToolbarFilter = ({
  fleets,
  selectedFleetNames,
  setSelectedFleets,
  allLabels,
  selectedLabels,
  setSelectedLabels,
  search,
  setSearch,
}: DeviceToolbarFilterProps) => {
  const { t } = useTranslation();
  const [isSearchTypeExpanded, setIsSearchTypeExpanded] = React.useState(false);
  const [selectedSearchType, setSelectedSearchType] = React.useState(LABEL_SEARCH);

  const onToggle = () => {
    setIsSearchTypeExpanded(!isSearchTypeExpanded);
  };

  const onSearchTypeSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    selection: string | number | undefined,
  ) => {
    setSelectedSearchType(selection as string);
    setIsSearchTypeExpanded(false);
  };

  const onSelectFleetOrLabel = (item: LabelFleetSelectItem) => {
    // Selecting a previously selected label does nothing. Labels can only be removed from the chips.
    const { id } = item;
    if (item.type === 'fleet') {
      const isSelected = selectedFleetNames.includes(id);
      if (!isSelected) {
        setSelectedFleets(selectedFleetNames.concat([id]));
      }
    } else {
      const isSelected = selectedLabels.some((label) => labelToString(label) === id);
      if (!isSelected) {
        const [key, val] = id.split('=');
        setSelectedLabels(selectedLabels.concat([{ key, value: val }]));
      }
    }
  };

  return (
    <>
      {setSearch && (
        <Select
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              onClick={onToggle}
              isExpanded={isSearchTypeExpanded}
              className="fctl_device-toolbar-filters__typeselect"
            >
              {selectedSearchType === NAME_SEARCH ? t('Name and alias') : t('Labels and fleets')}
            </MenuToggle>
          )}
          onSelect={onSearchTypeSelect}
          onOpenChange={(isOpen) => setIsSearchTypeExpanded(isOpen)}
          selected={selectedSearchType}
          isOpen={isSearchTypeExpanded}
        >
          <SelectList>
            <SelectOption id={NAME_SEARCH} value={NAME_SEARCH}>
              {t('Name and alias')}
            </SelectOption>
          </SelectList>
          <SelectOption id={LABEL_SEARCH} value={LABEL_SEARCH}>
            {t('Labels and fleets')}
          </SelectOption>
        </Select>
      )}
      {setSearch && selectedSearchType === NAME_SEARCH ? (
        <TableTextSearch value={search} setValue={setSearch} />
      ) : (
        <LabelFleetSelector
          allLabels={allLabels}
          fleets={fleets}
          selectedFleetNames={selectedFleetNames}
          selectedLabels={selectedLabels}
          onSelect={onSelectFleetOrLabel}
        />
      )}
    </>
  );
};

export default DeviceToolbarFilter;
