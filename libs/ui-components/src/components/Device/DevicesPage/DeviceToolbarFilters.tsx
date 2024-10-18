import * as React from 'react';
import debounce from 'lodash/debounce';
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
  onSelect: (type: 'fleet' | 'label', value: string) => void;
  placeholder?: string;
};

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
                  <SelectOption key={`label@@${labelStr}`} value={`label@@${labelStr}`}>
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
                <SelectOption key={`fleet@@${fleetName}`} value={`fleet@@${fleetName}`}>
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
  placeholder,
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
    .map((fleetName) => `fleet@@${fleetName}`)
    .concat(selectedLabels.map((label) => `label@@${labelToString(label)}`));

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
          placeholder={placeholder}
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
        const valStr = value as string;
        const id = valStr.split('@@')[1];
        if (valStr.startsWith('fleet@@')) {
          onSelect('fleet', id);
        } else {
          onSelect('label', id);
        }
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
  nameOrAlias?: TableTextSearchProps['value'];
  setNameOrAlias?: TableTextSearchProps['setValue'];
};

const DeviceToolbarFilter = ({
  fleets,
  selectedFleetNames,
  setSelectedFleets,
  allLabels,
  selectedLabels,
  setSelectedLabels,
  nameOrAlias,
  setNameOrAlias,
}: DeviceToolbarFilterProps) => {
  const { t } = useTranslation();
  const [isSearchTypeExpanded, setIsSearchTypeExpanded] = React.useState(false);
  const [selectedSearchType, setSelectedSearchType] = React.useState(LABEL_SEARCH);

  const [typingText, setTypingText] = React.useState<string>('');
  const debouncedSetParam = React.useMemo(
    () =>
      debounce((setValue: TableTextSearchProps['setValue'], value: string) => {
        setValue(value || '');
      }, 500),
    [],
  );

  React.useEffect(() => {
    if (setNameOrAlias) {
      debouncedSetParam(setNameOrAlias, typingText);
    }
  }, [typingText, setNameOrAlias, debouncedSetParam]);

  React.useEffect(() => {
    if (!nameOrAlias && typingText) {
      setTypingText('');
    }
    // When the filter is cleared from the chips, clear the "typingText" too
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameOrAlias, setTypingText]);

  const onToggle = () => {
    setIsSearchTypeExpanded(!isSearchTypeExpanded);
  };

  const onSearchTypeSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    selection: string | number | undefined,
  ) => {
    setSelectedSearchType(selection as string);
    setIsSearchTypeExpanded(false);
    if (selection === LABEL_SEARCH) {
      setTypingText('');
    }
  };

  const onSelectFleetOrLabel = (type: 'fleet' | 'label', id: string) => {
    // Selecting a previously selected label does nothing. Labels can only be removed from the chips.
    if (type === 'fleet') {
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
      {setNameOrAlias && (
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
      {setNameOrAlias && selectedSearchType === NAME_SEARCH ? (
        <TableTextSearch value={typingText} setValue={setTypingText} />
      ) : (
        <LabelFleetSelector
          placeholder={setNameOrAlias ? undefined : t('Filter by labels and fleets')}
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
