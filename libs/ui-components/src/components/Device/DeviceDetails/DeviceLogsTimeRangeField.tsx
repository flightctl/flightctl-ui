import * as React from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  CalendarMonth,
  Divider,
  Flex,
  FlexItem,
  FormGroup,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons/dist/js/icons/angle-right-icon';
import { OutlinedCalendarAltIcon } from '@patternfly/react-icons/dist/js/icons/outlined-calendar-alt-icon';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceLogSearchParams, DeviceLogTimeRange, getDeviceLogTimeRangeLabel } from '../../../utils/deviceLogs';

const fieldIdToggle = 'device-logs-time-range-toggle';
const BACK_OPTION_VALUE = 'back';

enum TimeRangeMenuView {
  PRESETS = 'presets',
  CUSTOM = 'custom',
}

type DateOption = 'from' | 'to';

const parseCalendarDate = (value: string) => new Date(`${value}T00:00:00`);

const formatCalendarDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const isIncompleteCustomRange = (
  timeRange: DeviceLogTimeRange | 'all' | undefined,
  dateFrom: string,
  dateTo: string,
): boolean => timeRange === DeviceLogTimeRange.CUSTOM_TIME_RANGE && dateFrom === '' && dateTo === '';

const isApplyDisabled = (dateFrom: string, dateTo: string): boolean => {
  if (!dateFrom && !dateTo) {
    return true;
  }

  if (dateFrom && dateTo && parseCalendarDate(dateFrom).getTime() > parseCalendarDate(dateTo).getTime()) {
    return true;
  }
  return false;
};

type DeviceLogsCustomDateInputProps = {
  dateOption: DateOption;
  value: string;
  isCalendarOpen: boolean;
  ariaLabel: string;
  onCalendarClick: VoidFunction;
  onChange: (value: string) => void;
};

const DeviceLogsCustomDateInput = ({
  dateOption,
  value,
  isCalendarOpen,
  ariaLabel,
  onCalendarClick,
  onChange,
}: DeviceLogsCustomDateInputProps) => {
  const { t } = useTranslation();
  const inputId = `device-logs-custom-date-${dateOption}`;

  return (
    <InputGroup>
      <InputGroupItem>
        <TextInput
          id={inputId}
          data-testid={inputId}
          aria-label={ariaLabel}
          placeholder={t('YYYY-MM-DD')}
          value={value}
          onChange={(_event, nextValue) => onChange(nextValue)}
        />
      </InputGroupItem>
      <InputGroupItem>
        <Button
          variant="control"
          aria-label={dateOption === 'from' ? t('Toggle calendar for start date') : t('Toggle calendar for end date')}
          aria-expanded={isCalendarOpen}
          aria-pressed={isCalendarOpen}
          icon={<OutlinedCalendarAltIcon />}
          onClick={onCalendarClick}
        />
      </InputGroupItem>
    </InputGroup>
  );
};

type DeviceLogsCustomTimeRangePanelProps = {
  draftFrom: string;
  draftTo: string;
  onDraftFromChange: (value: string) => void;
  onDraftToChange: (value: string) => void;
  onApply: VoidFunction;
  onClear: VoidFunction;
};

const dateValidators = [(date: Date) => date.getTime() <= Date.now()];

const DeviceLogsCustomTimeRangePanel = ({
  draftFrom,
  draftTo,
  onDraftFromChange,
  onDraftToChange,
  onApply,
  onClear,
}: DeviceLogsCustomTimeRangePanelProps) => {
  const { t } = useTranslation();
  const [dateOption, setDateOption] = React.useState<DateOption>();
  const activeValue = dateOption === 'to' ? draftTo : draftFrom;
  const calendarDate = parseCalendarDate(activeValue);
  const parsedFrom = parseCalendarDate(draftFrom);

  const onCalendarChange = (_event: React.MouseEvent<HTMLButtonElement>, date: Date) => {
    const dateStr = formatCalendarDate(date);
    if (dateOption === 'from') {
      onDraftFromChange(dateStr);
    } else if (dateOption === 'to') {
      onDraftToChange(dateStr);
    }
  };

  return (
    <div
      onMouseDown={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      }}
    >
      <Stack hasGutter>
        <StackItem>
          <Divider />
        </StackItem>
        <StackItem>
          <Title headingLevel="h3" size="md">
            {t('Custom range')}
          </Title>
        </StackItem>
        <StackItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>
              <DeviceLogsCustomDateInput
                dateOption="from"
                value={draftFrom}
                isCalendarOpen={dateOption === 'from'}
                ariaLabel={t('Start date')}
                onCalendarClick={() => setDateOption('from')}
                onChange={onDraftFromChange}
              />
            </FlexItem>
            <FlexItem>{t('to')}</FlexItem>
            <FlexItem>
              <DeviceLogsCustomDateInput
                dateOption="to"
                value={draftTo}
                isCalendarOpen={dateOption === 'to'}
                ariaLabel={t('End date')}
                onCalendarClick={() => setDateOption('to')}
                onChange={onDraftToChange}
              />
            </FlexItem>
          </Flex>
        </StackItem>
        {dateOption && (
          <>
            <StackItem style={{ textAlign: 'center' }}>
              <CalendarMonth
                date={calendarDate}
                rangeStart={parsedFrom}
                onChange={onCalendarChange}
                validators={dateValidators}
              />
            </StackItem>
            <StackItem>
              <ActionList>
                <ActionListGroup>
                  <ActionListItem>
                    <Button variant="primary" isDisabled={isApplyDisabled(draftFrom, draftTo)} onClick={onApply}>
                      {t('Apply')}
                    </Button>
                  </ActionListItem>

                  <ActionListItem>
                    <Button variant="link" onClick={onClear}>
                      {t('Clear')}
                    </Button>
                  </ActionListItem>
                </ActionListGroup>
              </ActionList>
            </StackItem>
          </>
        )}
      </Stack>
    </div>
  );
};

const DeviceLogsTimeRangeField = () => {
  const { t } = useTranslation();
  const {
    values: { timeRange, dateFrom, dateTo },
    setFieldValue,
    setFieldTouched,
    validateForm,
  } = useFormikContext<DeviceLogSearchParams>();
  const [isOpen, setIsOpen] = React.useState(false);
  const [menuView, setMenuView] = React.useState<TimeRangeMenuView>(TimeRangeMenuView.PRESETS);
  const [draftFrom, setDraftFrom] = React.useState('');
  const [draftTo, setDraftTo] = React.useState('');

  const toggleText = timeRange === 'all' ? t('All time') : getDeviceLogTimeRangeLabel(t, timeRange);

  const clearIncompleteCustomRange = React.useCallback(() => {
    if (!isIncompleteCustomRange(timeRange, dateFrom, dateTo)) {
      return;
    }
    void setFieldValue('timeRange', undefined);
    void setFieldValue('dateFrom', '');
    void setFieldValue('dateTo', '');
    void setFieldTouched('timeRange', false);
    void setFieldTouched('dateFrom', false);
    void setFieldTouched('dateTo', false);
    void validateForm();
  }, [setFieldTouched, setFieldValue, validateForm, timeRange, dateFrom, dateTo]);

  const openCustomRangeView = React.useCallback(() => {
    setDraftFrom(dateFrom);
    setDraftTo(dateTo);
    setMenuView(TimeRangeMenuView.CUSTOM);
  }, [dateFrom, dateTo]);

  const onTimeRangeSelected = React.useCallback(
    (event: React.MouseEvent | undefined, value: string | number | undefined) => {
      if (value === BACK_OPTION_VALUE) {
        event?.preventDefault();
        clearIncompleteCustomRange();
        setMenuView(TimeRangeMenuView.PRESETS);
        return;
      }
      const selection = value as DeviceLogTimeRange;
      if (selection === DeviceLogTimeRange.CUSTOM_TIME_RANGE) {
        // Defer swapping menu content until after the click reaches Select's window listener.
        window.setTimeout(() => {
          if (selection !== timeRange) {
            void setFieldValue('timeRange', selection);
            void setFieldTouched('dateFrom', false);
            void setFieldTouched('dateTo', false);
          }
          void setFieldTouched('timeRange', true);
          openCustomRangeView();
        }, 0);
        return;
      } else if (selection === timeRange) {
        setIsOpen(false);
        return;
      }
      void setFieldValue('timeRange', selection);
      void setFieldValue('dateFrom', '');
      void setFieldValue('dateTo', '');
      void setFieldTouched('timeRange', true);
      void setFieldTouched('dateFrom', false);
      void setFieldTouched('dateTo', false);
      setMenuView(TimeRangeMenuView.PRESETS);
      setIsOpen(false);
    },
    [clearIncompleteCustomRange, openCustomRangeView, setFieldTouched, setFieldValue, timeRange],
  );

  const onCustomRangeApply = React.useCallback(() => {
    void setFieldValue('dateFrom', draftFrom);
    void setFieldValue('dateTo', draftTo);
    void setFieldTouched('dateFrom', true);
    void setFieldTouched('dateTo', true);
    void setFieldTouched('timeRange', true);
    void validateForm();
    setIsOpen(false);
  }, [draftFrom, draftTo, setFieldTouched, setFieldValue, validateForm]);

  const onCustomRangeClear = React.useCallback(() => {
    setDraftFrom('');
    setDraftTo('');
  }, []);

  return (
    <FormGroup id="form-control__device-logs-time-range" fieldId={fieldIdToggle}>
      <Select
        id="device-logs-time-range"
        selected={timeRange}
        onSelect={onTimeRangeSelected}
        shouldFocusToggleOnSelect={false}
        shouldFocusFirstItemOnOpen={false}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (open) {
            setMenuView(TimeRangeMenuView.PRESETS);
          } else if (isIncompleteCustomRange(timeRange, dateFrom, dateTo)) {
            clearIncompleteCustomRange();
            setMenuView(TimeRangeMenuView.PRESETS);
          } else {
            void setFieldTouched('timeRange', true);
          }
          setIsOpen(open);
        }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            className="fctl-form-select__toggle"
            id={fieldIdToggle}
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            aria-label={t('Time')}
            style={{ minWidth: '12rem' }}
          >
            {toggleText}
          </MenuToggle>
        )}
      >
        {menuView === TimeRangeMenuView.PRESETS ? (
          <>
            <SelectList>
              <SelectOption value="all" isSelected={timeRange === 'all'}>
                {t('All time')}
              </SelectOption>
            </SelectList>
            <Divider />
            <SelectGroup label={t('Presets')}>
              <SelectList>
                <SelectOption
                  value={DeviceLogTimeRange.LAST_HOUR}
                  isSelected={timeRange === DeviceLogTimeRange.LAST_HOUR}
                >
                  {t('Last 1 hour')}
                </SelectOption>
                <SelectOption
                  value={DeviceLogTimeRange.LAST_24_HOURS}
                  isSelected={timeRange === DeviceLogTimeRange.LAST_24_HOURS}
                >
                  {t('Last 24 hours')}
                </SelectOption>
                <SelectOption
                  value={DeviceLogTimeRange.LAST_7_DAYS}
                  isSelected={timeRange === DeviceLogTimeRange.LAST_7_DAYS}
                >
                  {t('Last 7 days')}
                </SelectOption>
              </SelectList>
            </SelectGroup>
            <Divider />
            <SelectGroup label={t('Boot')}>
              <SelectList>
                <SelectOption
                  value={DeviceLogTimeRange.CURRENT_BOOT}
                  isSelected={timeRange === DeviceLogTimeRange.CURRENT_BOOT}
                >
                  {t('Current boot')}
                </SelectOption>
                <SelectOption
                  value={DeviceLogTimeRange.PREVIOUS_BOOT}
                  isSelected={timeRange === DeviceLogTimeRange.PREVIOUS_BOOT}
                >
                  {t('Previous boot')}
                </SelectOption>
              </SelectList>
            </SelectGroup>
            <Divider />
            <SelectGroup label={t('Custom')}>
              <SelectList>
                <SelectOption
                  value={DeviceLogTimeRange.CUSTOM_TIME_RANGE}
                  isSelected={timeRange === DeviceLogTimeRange.CUSTOM_TIME_RANGE}
                >
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                    <FlexItem>{t('Custom range')}</FlexItem>
                    <FlexItem>
                      <AngleRightIcon />
                    </FlexItem>
                  </Flex>
                </SelectOption>
              </SelectList>
            </SelectGroup>
          </>
        ) : (
          <SelectGroup className="pf-v6-u-p-md" style={{ minWidth: '14rem' }}>
            <SelectList
              onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
              }}
            >
              <SelectOption
                value={BACK_OPTION_VALUE}
                style={{ '--pf-v6-c-menu__item--PaddingInlineStart': '0' } as React.CSSProperties}
              >
                <Flex>
                  <FlexItem>
                    <AngleRightIcon style={{ transform: 'rotate(180deg)' }} aria-hidden />
                  </FlexItem>
                  <FlexItem>{t('Back')}</FlexItem>
                </Flex>
              </SelectOption>
            </SelectList>
            <DeviceLogsCustomTimeRangePanel
              draftFrom={draftFrom}
              draftTo={draftTo}
              onDraftFromChange={setDraftFrom}
              onDraftToChange={setDraftTo}
              onApply={onCustomRangeApply}
              onClear={onCustomRangeClear}
            />
          </SelectGroup>
        )}
      </Select>
    </FormGroup>
  );
};

export default DeviceLogsTimeRangeField;
