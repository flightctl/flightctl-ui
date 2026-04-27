import * as React from 'react';
import debounce from 'lodash/debounce';
import {
  Button,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons/dist/js/icons/times-icon';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';

import { Fleet, FleetList, LabelList } from '@flightctl/types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { isPromiseFulfilled } from '../../../types/typeUtils';

import TableTextSearch from '../../Table/TableTextSearch';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { commonQueries as queries } from '../../../utils/query';
import { MAX_TOTAL_SEARCH_RESULTS, getEmptyFleetSearch, getSearchResultsCount } from '../../../utils/search';
import { labelToString, stringToLabel } from '../../../utils/labels';
import {
  DEVICE_TEXT_FILTER_KEYS,
  DeviceFilterTypes,
  DeviceTextFilterKey,
  FilterSearchParams,
  getDeviceFilterLabel,
  isValidCveIdFilterValue,
} from '../../../utils/status/devices';

import './DeviceToolbarFilters.css';

type LabelFleetSelectorProps = {
  selectedFleetNames: string[];
  selectedLabels: FlightCtlLabel[];
  onSelect: (type: 'fleet' | 'label', value: string) => void;
  placeholder?: string;
};

// Escapes special characters (eg. 'hello.world' becomes 'hello\\.world')
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LabelFleetResults = ({
  filterText,
  allLabels,
  fleetNames,
  isUpdating,
  selectedFleetNames,
  selectedLabels,
}: {
  filterText: string;
  isUpdating: boolean;
  fleetNames: string[];
  selectedLabels: FlightCtlLabel[];
  selectedFleetNames: string[];
  allLabels: FlightCtlLabel[];
}) => {
  const { t } = useTranslation();

  const regexp = React.useMemo(() => new RegExp(`(${escapeRegExp(filterText)})`, 'g'), [filterText]);

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
        <Spinner size="md" className="pf-v6-u-mr-sm" />
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
                const isSelected = selectedLabels.map(labelToString).includes(labelStr);
                return (
                  <SelectOption
                    key={`label@@${labelStr}`}
                    value={`label@@${labelStr}`}
                    hasCheckbox
                    isSelected={isSelected}
                  >
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
                  <SelectOption
                    key={`fleet@@${fleetName}`}
                    value={`fleet@@${fleetName}`}
                    hasCheckbox
                    isSelected={selectedFleetNames.includes(fleetName)}
                  >
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
    setFilterText('');
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
    const labelMatches = get<LabelList>(
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
        <Icon size="md">
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
          <Button
            icon={<TimesIcon aria-hidden />}
            variant="plain"
            onClick={onClearButtonClick}
            aria-label={t('Clear filter text')}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="fleet-label-typeahead-select-listbox"
      isOpen={isOpen}
      onSelect={(_event, value) => {
        const valStr = value as string;
        const id = valStr.split('@@')[1];
        if (valStr.startsWith('fleet@@')) {
          onSelect('fleet', id);
        } else {
          onSelect('label', id);
        }
      }}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeMenu();
        }
      }}
      toggle={toggle}
    >
      {filterText && (
        <LabelFleetResults
          isUpdating={isUpdating}
          filterText={filterText}
          fleetNames={fleetNameResults}
          selectedFleetNames={selectedFleetNames}
          allLabels={labelResults}
          selectedLabels={selectedLabels}
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
  textFilters?: Partial<Record<DeviceTextFilterKey, string>>;
  setTextFilter?: (key: DeviceTextFilterKey, value: string) => void;
};

const DeviceToolbarFilter = ({
  selectedFleetNames,
  setSelectedFleets,
  selectedLabels,
  setSelectedLabels,
  textFilters = {},
  setTextFilter,
}: DeviceToolbarFilterProps) => {
  const { t } = useTranslation();
  const [isSearchTypeExpanded, setIsSearchTypeExpanded] = React.useState(false);
  const [selectedSearchType, setSelectedSearchType] = React.useState<DeviceFilterTypes>(FilterSearchParams.Label);
  const [freeTextFilterError, setFreeTextFilterError] = React.useState<string | undefined>(undefined);

  const [typingText, setTypingText] = React.useState<string>('');
  const debouncedSetTextFilter = React.useMemo(
    () =>
      debounce((key: DeviceTextFilterKey, value: string) => {
        if (key === FilterSearchParams.CveId) {
          const isValid = isValidCveIdFilterValue(value);
          setFreeTextFilterError(
            isValid
              ? undefined
              : t(
                  'Enter a valid CVE ID in the form CVE-YYYY-sequence, with sequence containing at least 4 digits (for example, CVE-2024-12345).',
                ),
          );
          if (!isValid) {
            return;
          }
        }
        setTextFilter?.(key, value || '');
      }, 500),
    [setTextFilter, t],
  );

  const urlValueForTextMode =
    selectedSearchType !== FilterSearchParams.Label ? textFilters[selectedSearchType] : undefined;

  React.useEffect(() => {
    if (!setTextFilter || selectedSearchType === FilterSearchParams.Label) {
      return undefined;
    }
    debouncedSetTextFilter(selectedSearchType, typingText);
    return () => {
      debouncedSetTextFilter.cancel();
    };
  }, [typingText, selectedSearchType, setTextFilter, debouncedSetTextFilter]);

  React.useEffect(() => {
    if (selectedSearchType === FilterSearchParams.Label) {
      return;
    }
    if (!urlValueForTextMode && typingText) {
      setTypingText('');
    }
    // When the filter is cleared from the chips, clear the "typingText" too
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSearchType, urlValueForTextMode, setTypingText]);

  const onToggle = () => {
    setIsSearchTypeExpanded(!isSearchTypeExpanded);
  };

  const onSearchTypeSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    selection: string | number | undefined,
  ) => {
    const sel = selection as DeviceFilterTypes;
    setSelectedSearchType(sel);
    setIsSearchTypeExpanded(false);
    if (sel === FilterSearchParams.Label) {
      setTypingText('');
    } else {
      setTypingText(textFilters[sel] ?? '');
    }
  };

  const onSelectFleetOrLabel = (type: 'fleet' | 'label', id: string) => {
    if (type === 'fleet') {
      const isSelected = selectedFleetNames.includes(id);

      if (isSelected) {
        setSelectedFleets(selectedFleetNames.filter((name) => name !== id));
      } else {
        setSelectedFleets(selectedFleetNames.concat([id]));
      }
    } else {
      const isSelected = selectedLabels.some((label) => labelToString(label) === id);
      const [key, val] = id.split('=');

      if (isSelected) {
        setSelectedLabels(selectedLabels.filter((label) => label.key !== key || label.value !== val));
      } else {
        setSelectedLabels(selectedLabels.concat([{ key, value: val }]));
      }
    }
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex>
          <FlexItem>
            {setTextFilter && (
              <Select
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={onToggle}
                    isExpanded={isSearchTypeExpanded}
                    style={
                      {
                        width: '250px',
                      } as React.CSSProperties
                    }
                  >
                    {getDeviceFilterLabel(t, selectedSearchType)}
                  </MenuToggle>
                )}
                onSelect={onSearchTypeSelect}
                onOpenChange={(isOpen) => setIsSearchTypeExpanded(isOpen)}
                selected={selectedSearchType}
                isOpen={isSearchTypeExpanded}
              >
                <SelectList>
                  <SelectOption id={FilterSearchParams.Label} value={FilterSearchParams.Label}>
                    {t('Labels and fleets')}
                  </SelectOption>
                  {DEVICE_TEXT_FILTER_KEYS.map((key) => (
                    <SelectOption key={key} id={key} value={key}>
                      {getDeviceFilterLabel(t, key)}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            )}
          </FlexItem>
          <FlexItem>
            {setTextFilter && selectedSearchType !== FilterSearchParams.Label ? (
              <TableTextSearch value={typingText} setValue={setTypingText} />
            ) : (
              <LabelFleetSelector
                placeholder={setTextFilter ? undefined : t('Filter by labels and fleets')}
                selectedFleetNames={selectedFleetNames}
                selectedLabels={selectedLabels}
                onSelect={onSelectFleetOrLabel}
              />
            )}
          </FlexItem>
        </Flex>
        {freeTextFilterError && (
          <StackItem className="pf-v6-u-mt-sm">
            <HelperText>
              <HelperTextItem variant="error">{freeTextFilterError}</HelperTextItem>
            </HelperText>
          </StackItem>
        )}
      </StackItem>
    </Stack>
  );
};

export default DeviceToolbarFilter;
