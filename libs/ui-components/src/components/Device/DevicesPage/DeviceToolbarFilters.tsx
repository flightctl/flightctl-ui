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
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons/dist/js/icons/times-icon';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';

import { DeviceLabelList, Fleet, FleetList } from '@flightctl/types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { isPromiseFulfilled } from '../../../types/typeUtils';

import TableTextSearch, { TableTextSearchProps } from '../../Table/TableTextSearch';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { commonQueries as queries } from '../../../utils/query';
import { MAX_TOTAL_SEARCH_RESULTS, getEmptyFleetSearch, getSearchResultsCount } from '../../../utils/search';
import { labelToString, stringToLabel } from '../../../utils/labels';

import './DeviceToolbarFilters.css';

const NAME_SEARCH = 'NameAndAlias';
const LABEL_SEARCH = 'LabelsAndFleets';

type LabelFleetSelectorProps = {
  selectedFleetNames: string[];
  selectedLabels: FlightCtlLabel[];
  onSelect: (type: 'fleet' | 'label', value: string) => void;
  placeholder?: string;
};

const LabelFleetResults = ({
  filterText,
  allLabels,
  fleetNames,
  isUpdating,
}: {
  filterText: string;
  isUpdating: boolean;
  fleetNames: string[];
  allLabels: FlightCtlLabel[];
}) => {
  const { t } = useTranslation();
  const regexp = React.useMemo(() => new RegExp(`(${filterText})`, 'g'), [filterText]);

  const searchHighlighter = React.useCallback(
    (text: string) => {
      return text
        .split(regexp)
        .filter(Boolean)
        .map((part, index) => (part.trim() === filterText ? <strong key={`part-${index}`}>{part}</strong> : part));
    },
    [filterText, regexp],
  );

  if (isUpdating) {
    return (
      <div className="fctl-device-toolbar-filters__hint">
        <Spinner size="md" className="pf-v5-u-mr-sm" />
        {t('Searching...')}
      </div>
    );
  }

  const [visibleLabels, visibleFleets] = getSearchResultsCount(allLabels.length, fleetNames.length);
  if (visibleLabels + visibleFleets === 0) {
    return <div className="fctl-device-toolbar-filters__hint">{t('No results')}</div>;
  }

  return (
    <>
      {visibleLabels > 0 && (
        <SelectGroup label={t('Labels')}>
          <SelectList id="select-typeahead-labels-listbox">
            {allLabels
              .filter((_, index) => index < visibleLabels)
              .map((label) => {
                const labelStr = labelToString(label);
                const labelStrParts = searchHighlighter(labelStr);
                return (
                  <SelectOption key={`label@@${labelStr}`} value={`label@@${labelStr}`}>
                    <span>{labelStrParts}</span>
                  </SelectOption>
                );
              })}
          </SelectList>
        </SelectGroup>
      )}
      {visibleFleets > 0 && (
        <SelectGroup label={t('Fleets')}>
          <SelectList id="select-typeahead-fleets-listbox">
            {fleetNames
              .filter((_, index) => index < visibleFleets)
              .map((fleetName) => {
                const fleetNameParts = searchHighlighter(fleetName);
                return (
                  <SelectOption key={`fleet@@${fleetName}`} value={`fleet@@${fleetName}`}>
                    <span>{fleetNameParts}</span>
                  </SelectOption>
                );
              })}
          </SelectList>
        </SelectGroup>
      )}
    </>
  );
};

const LabelFleetSelector = ({ selectedFleetNames, selectedLabels, onSelect, placeholder }: LabelFleetSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filterText, setFilterText] = React.useState<string>('');
  const [fleetNameResults, setFleetNameResults] = React.useState<string[]>([]);
  const [labelResults, setLabelResults] = React.useState<FlightCtlLabel[]>([]);
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);

  const { get } = useFetch();

  const textInputRef = React.useRef<HTMLInputElement>();

  const { t } = useTranslation();

  const onToggleClick = () => {
    if (!isOpen) {
      textInputRef?.current?.focus();
    }
    setIsOpen(!isOpen);
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

  const fetchTextMatches = async (val: string) => {
    const searchOnlyLabels = val.includes('=');
    const labelMatches = get<DeviceLabelList>(
      queries.getDevicesWithPartialLabelMatching(val, { limit: MAX_TOTAL_SEARCH_RESULTS }),
    );

    const fleetMatches = searchOnlyLabels
      ? Promise.resolve(getEmptyFleetSearch())
      : get<FleetList>(queries.getFleetsWithNameMatching(val, { limit: MAX_TOTAL_SEARCH_RESULTS }));

    const [labelMatchResult, fleetMatchResult] = await Promise.allSettled([labelMatches, fleetMatches]);

    let newLabels: FlightCtlLabel[] = [];
    if (isPromiseFulfilled(labelMatchResult)) {
      newLabels = labelMatchResult.value.map(stringToLabel);
    }

    let newFleets: string[] = [];
    if (isPromiseFulfilled(fleetMatchResult)) {
      newFleets = fleetMatchResult.value.items?.map((fleet: Fleet) => fleet.metadata.name || '') || [];
    }
    setLabelResults(newLabels);
    setFleetNameResults(newFleets);
    setIsUpdating(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce((val: string) => {
      fetchTextMatches(val);
    }, 800),
    [],
  );

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    if (value) {
      setFilterText(value);
      if (!isUpdating) {
        // Start showing the spinner before the debounced function is triggered
        setIsUpdating(true);
      }
      void debouncedUpdate(value);
    } else {
      setFilterText('');
    }
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
      {filterText && (
        <LabelFleetResults
          isUpdating={isUpdating}
          filterText={filterText}
          fleetNames={fleetNameResults}
          allLabels={labelResults}
        />
      )}
    </Select>
  );
};

type DeviceToolbarFilterProps = {
  selectedFleetNames: string[];
  setSelectedFleets: (ownerFleets: string[]) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  nameOrAlias?: TableTextSearchProps['value'];
  setNameOrAlias?: TableTextSearchProps['setValue'];
};

const DeviceToolbarFilter = ({
  selectedFleetNames,
  setSelectedFleets,
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
          selectedFleetNames={selectedFleetNames}
          selectedLabels={selectedLabels}
          onSelect={onSelectFleetOrLabel}
        />
      )}
    </>
  );
};

export default DeviceToolbarFilter;
