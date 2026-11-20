import * as React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Flex,
  FlexItem,
  FormGroup,
  FormSection,
  Label,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { setIn, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';

import { useTranslation } from '../../../../hooks/useTranslation';
import useTimeZones from '../../../../hooks/useTimeZones';
import { getCalendarDateDisplay } from '../../../../utils/dates';
import * as timeUtils from '../../../../utils/time';
import { getOneTimeWindowTimeZone } from '../fleetSpecUtils';
import { type FleetFormValues, type OneTimeWindowForm, type UpdatePolicyForm } from '../../../../types/deviceSpec';
import CalendarDateField from '../../../form/CalendarDateField';
import { DefaultHelperText } from '../../../form/FieldHelperText';
import FormSelectTypeahead from '../../../form/FormSelectTypeahead';
import TextField from '../../../form/TextField';
import ExpandableFormCard from './ExpandableFormCard';

const OverlapAlert = ({ config, entry }: { config: ScheduleTimeZoneConfig; entry: OneTimeWindowEntry }) => {
  const { t } = useTranslation();
  if (!config.hasRecurring || !config.canAssessOverlap) {
    return null;
  }
  const assessment = timeUtils.assessOneTimeStandingOverlap(
    entry.window.date,
    entry.window.startsAt,
    timeUtils.getEndTime(entry.window.startsAt, entry.window.startGraceDuration),
    config.timeZone,
    config.standing,
  );
  if (assessment.kind === 'none') {
    return null;
  }

  const standingRange =
    config.standing.startsAt && config.standing.endsAt
      ? `${config.standing.startsAt}–${config.standing.endsAt}`
      : undefined;

  let bodyText = '';
  let title = '';
  switch (assessment.kind) {
    case 'likely_covered':
      bodyText = standingRange
        ? t(
            'This one-time window falls entirely inside the recurring schedule ({{ range }}) on that day. Confirm you still need a separate one-time window. Saving is not blocked.',
            { range: standingRange },
          )
        : t(
            'This one-time window falls entirely inside the recurring schedule on that day. Confirm you still need a separate one-time window. Saving is not blocked.',
          );
      title = t('May already be covered');
      break;
    case 'clock_overlap':
      bodyText = standingRange
        ? t(
            'This one-time window overlaps the recurring schedule ({{ range }}) on that day. Updates may start in either period. Saving is not blocked.',
            { range: standingRange },
          )
        : t(
            'This one-time window overlaps the recurring schedule on that day. Updates may start in either period. Saving is not blocked.',
          );
      title = t('Overlapping windows');
      break;
    case 'timezone_uncertain':
      bodyText = t(
        'This one-time window uses a different timezone than the recurring schedule. Overlap cannot be confirmed accurately. Review both schedules carefully. Saving is not blocked.',
      );
      title = t('Timezone differs from recurring schedule');
      break;
  }

  return (
    <Alert variant="warning" isInline title={title}>
      {bodyText}
    </Alert>
  );
};

const TimePair = ({
  startName,
  startsAt,
  startGraceDuration,
  isReadOnly,
  mirrorFieldPrefix,
}: {
  startName: string;
  startsAt: string;
  startGraceDuration: string;
  isReadOnly?: boolean;
  mirrorFieldPrefix?: string;
}) => {
  const { t } = useTranslation();
  const { setFieldValue } = useFormikContext<FleetFormValues>();
  const selectableTimes = React.useMemo(() => timeUtils.getSelectableTimes(), []);
  const isValidTypedItem = React.useCallback((value: string) => timeUtils.valid24HourClockRegExp.test(value), []);
  const transformTypedItem = React.useCallback((time: string) => {
    if (timeUtils.formatted24HourClockRegExp.test(time)) {
      return time;
    }
    const match = time.match(/^(\d{1,2})?:?(\d{2})?$/);
    return match ? `${timeUtils.formatTimePart(match[1])}:${match[2]}` : timeUtils.defaultStartTime;
  }, []);

  const derivedEnd = timeUtils.getEndTime(startsAt || timeUtils.defaultStartTime, startGraceDuration);

  return (
    <Flex>
      <FlexItem>
        <FormSelectTypeahead
          name={startName}
          placeholderText={t('Enter time (hh:mm)', { nsSeparator: '|' })}
          defaultId={timeUtils.defaultStartTime}
          items={selectableTimes}
          isValidTypedItem={isValidTypedItem}
          transformTypedItem={transformTypedItem}
          isDisabled={isReadOnly}
          onChangeCustom={
            mirrorFieldPrefix ? (value) => void setFieldValue(`${mirrorFieldPrefix}.startsAt`, value) : undefined
          }
        />
      </FlexItem>
      <FlexItem>
        <span className="fctl-one-time-windows__to">{t('to')}</span>
      </FlexItem>
      <FlexItem>
        <TextInput value={derivedEnd} isDisabled aria-label={t('End time')} />
      </FlexItem>
    </Flex>
  );
};

type OneTimeWindowSchedule = 'download' | 'install';

type RemovableWindow = {
  schedule: OneTimeWindowSchedule;
  window: OneTimeWindowForm;
};

type OneTimeWindowEntry = RemovableWindow & {
  index: number;
  displayIndex: number;
};

type ScheduleTimeZoneConfig = {
  hasRecurring: boolean;
  canAssessOverlap: boolean;
  timeZone: string;
  standing: timeUtils.StandingScheduleFields;
};

const getScheduleTimeZoneConfig = (
  updatePolicy: UpdatePolicyForm,
  schedule: OneTimeWindowSchedule,
  window?: OneTimeWindowForm,
): ScheduleTimeZoneConfig => {
  const useInstallFields = schedule === 'install' && updatePolicy.downloadAndInstallDiffer;
  const cron = useInstallFields ? updatePolicy.installCron : updatePolicy.downloadCron;
  const hasRecurring = Boolean(cron);
  const startsAt = useInstallFields ? updatePolicy.installStartsAt : updatePolicy.downloadStartsAt;
  const startGraceDuration = useInstallFields
    ? updatePolicy.installStartGraceDuration
    : updatePolicy.downloadStartGraceDuration;
  const timeZone = getOneTimeWindowTimeZone(updatePolicy, schedule, window);
  return {
    hasRecurring,
    canAssessOverlap: !cron || timeUtils.isUiSupportedCron(cron),
    timeZone,
    standing: {
      startsAt,
      endsAt: startsAt ? timeUtils.getEndTime(startsAt, startGraceDuration) : undefined,
      scheduleMode: useInstallFields ? updatePolicy.installScheduleMode : updatePolicy.downloadScheduleMode,
      weekDays: useInstallFields ? updatePolicy.installWeekDays : updatePolicy.downloadWeekDays,
      timeZone: schedule === 'install' ? updatePolicy.installTimeZone : updatePolicy.downloadTimeZone,
    },
  };
};

const getWindowFieldPrefix = (entry: Pick<OneTimeWindowEntry, 'schedule' | 'index'>) =>
  `updatePolicy.${entry.schedule === 'install' ? 'installOneTimeWindows' : 'downloadOneTimeWindows'}[${entry.index}]`;

const getScheduleWindows = (updatePolicy: UpdatePolicyForm, schedule: OneTimeWindowSchedule) =>
  (schedule === 'install' ? updatePolicy.installOneTimeWindows : updatePolicy.downloadOneTimeWindows) || [];

const OneTimeWindowTimeZone = ({
  name,
  schedule,
  scheduleTimeZone,
  mirrorName,
  mirrorScheduleTimeZone,
  label,
  isReadOnly,
}: {
  name: string;
  schedule: OneTimeWindowSchedule;
  scheduleTimeZone: string;
  mirrorName?: string;
  mirrorScheduleTimeZone?: string;
  label?: string;
  isReadOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const [{ value }] = useField<string | undefined>({ name });
  const { setValues } = useFormikContext<FleetFormValues>();
  const timeZones = useTimeZones();
  const timeZoneOptions = {
    [timeUtils.localDeviceTimezone]: t("device's local timezone"),
    ...timeZones,
  };
  const globalTimeZoneLabel =
    scheduleTimeZone === timeUtils.localDeviceTimezone ? t("device's local timezone") : scheduleTimeZone;
  const isUsingGlobal = (value ?? scheduleTimeZone) === scheduleTimeZone;
  const setTimeZone = (timeZone: string | undefined) => {
    const selectedTimeZone = timeZone ?? scheduleTimeZone;
    const timeZoneOverride = selectedTimeZone === scheduleTimeZone ? undefined : selectedTimeZone;
    const mirrorTimeZoneOverride =
      selectedTimeZone === mirrorScheduleTimeZone ? undefined : selectedTimeZone;
    void setValues((values) => {
      const withTimeZone = setIn(values, name, timeZoneOverride) as FleetFormValues;
      return mirrorName
        ? (setIn(withTimeZone, mirrorName, mirrorTimeZoneOverride) as FleetFormValues)
        : withTimeZone;
    });
  };

  return (
    <FormGroup label={label || (schedule === 'install' ? t('Update timezone') : t('Download timezone'))}>
      {isReadOnly ? (
        <span>
          {value === timeUtils.localDeviceTimezone
            ? t("device's local timezone")
            : value || globalTimeZoneLabel}
        </span>
      ) : (
        <>
          <Checkbox
            id={name}
            label={t('Use global timezone ({{timeZone}})', { timeZone: globalTimeZoneLabel })}
            isChecked={isUsingGlobal}
            onChange={(_, checked) => setTimeZone(checked ? scheduleTimeZone : '')}
          />
          {!isUsingGlobal && (
            <FormSelectTypeahead
              name={name}
              defaultId={
                value === '' || scheduleTimeZone === timeUtils.localDeviceTimezone ? '' : scheduleTimeZone
              }
              items={timeZoneOptions}
              placeholderText={t('Select a timezone')}
              onChangeCustom={(selectedTimeZone) => {
                setTimeZone(selectedTimeZone);
              }}
            />
          )}
        </>
      )}
    </FormGroup>
  );
};

const OneTimeWindowCard = ({
  entries,
  isReadOnly,
  onRemove,
}: {
  entries: OneTimeWindowEntry[];
  isReadOnly?: boolean;
  onRemove: (items: RemovableWindow[]) => void;
}) => {
  const { t } = useTranslation();
  const {
    values: { updatePolicy },
    setValues,
    setFieldValue,
  } = useFormikContext<FleetFormValues>();
  const firstEntry = entries[0];
  const [isExpanded, setIsExpanded] = React.useState(!firstEntry.window.date);
  const hasDownload = entries.some((entry) => entry.schedule === 'download');
  const hasUpdate = entries.some((entry) => entry.schedule === 'install');
  const isMixed = hasDownload && hasUpdate;
  const downloadEntry = entries.find((entry) => entry.schedule === 'download');
  const installEntry = entries.find((entry) => entry.schedule === 'install');
  const groupKey = entries.map((entry) => `${entry.schedule}|${entry.window.id}`).join('|');
  // Pair fields by default only when time, grace, and effective timezone match.
  const defaultIsSplit = Boolean(
    downloadEntry &&
      installEntry &&
      (downloadEntry.window.startsAt !== installEntry.window.startsAt ||
        downloadEntry.window.startGraceDuration !== installEntry.window.startGraceDuration ||
        getOneTimeWindowTimeZone(updatePolicy, 'download', downloadEntry.window) !==
          getOneTimeWindowTimeZone(updatePolicy, 'install', installEntry.window)),
  );
  const [splitState, setSplitState] = React.useState({ groupKey, value: defaultIsSplit });
  const isSplit = splitState.groupKey === groupKey ? splitState.value : defaultIsSplit;
  const hasSharedWindowFields = !isSplit && Boolean(downloadEntry && installEntry);
  const editableEntries = hasSharedWindowFields && downloadEntry ? [downloadEntry] : entries;
  const mirrorFieldPrefix = hasSharedWindowFields && installEntry ? getWindowFieldPrefix(installEntry) : undefined;

  const setSplit = (checked: boolean) => {
    if (!checked && downloadEntry && installEntry) {
      const downloadTimeZone = getOneTimeWindowTimeZone(updatePolicy, 'download', downloadEntry.window);
      const installTimeZone = getOneTimeWindowTimeZone(updatePolicy, 'install', installEntry.window);
      // Local cannot override a different schedule timezone, so prefer the other side's concrete timezone.
      const sharedTimeZone =
        downloadTimeZone === timeUtils.localDeviceTimezone ? installTimeZone : downloadTimeZone;
      const downloadTimeZoneOverride =
        sharedTimeZone === updatePolicy.downloadTimeZone ? undefined : sharedTimeZone;
      const installTimeZoneOverride =
        sharedTimeZone === updatePolicy.installTimeZone ? undefined : sharedTimeZone;
      const downloadPrefix = getWindowFieldPrefix(downloadEntry);
      const installPrefix = getWindowFieldPrefix(installEntry);
      void setValues((values) => {
        const withStart = setIn(
          values,
          `${installPrefix}.startsAt`,
          downloadEntry.window.startsAt,
        ) as FleetFormValues;
        const withGrace = setIn(
          withStart,
          `${installPrefix}.startGraceDuration`,
          downloadEntry.window.startGraceDuration,
        ) as FleetFormValues;
        const withDownloadTimeZone = setIn(
          withGrace,
          `${downloadPrefix}.timeZone`,
          downloadTimeZoneOverride,
        ) as FleetFormValues;
        return setIn(withDownloadTimeZone, `${installPrefix}.timeZone`, installTimeZoneOverride) as FleetFormValues;
      });
    }
    setSplitState({ groupKey, value: checked });
  };

  // One setValues keeps the paired entries in sync and validates them atomically.
  const syncGroupedDate = (date: string) =>
    void setValues((values) =>
      entries.reduce<FleetFormValues>(
        (next, entry) => setIn(next, `${getWindowFieldPrefix(entry)}.date`, date) as FleetFormValues,
        values,
      ),
    );

  const title = firstEntry.window.date
    ? `${t('One-time window')} · ${getCalendarDateDisplay(firstEntry.window.date)}`
    : `${t('One-time window')} ${firstEntry.displayIndex}`;

  const headerChip = isMixed ? t('One-time') : hasUpdate ? t('Update') : t('Download');

  const helperText = isMixed
    ? t(
        'Devices may start downloading or updating during this window. Work that has already started can finish after the window ends.',
      )
    : hasUpdate
      ? t(
          'Devices may start updating during this window. Work that has already started can finish after the window ends.',
        )
      : t(
          'Devices may start downloading during this window. Work that has already started can finish after the window ends.',
        );

  const renderTimeZone = (entry: OneTimeWindowEntry, mirrorEntry?: OneTimeWindowEntry) => (
    <OneTimeWindowTimeZone
      name={[getWindowFieldPrefix(entry), 'timeZone'].join('.')}
      schedule={entry.schedule}
      scheduleTimeZone={getOneTimeWindowTimeZone(updatePolicy, entry.schedule)}
      mirrorName={mirrorEntry ? [getWindowFieldPrefix(mirrorEntry), 'timeZone'].join('.') : undefined}
      mirrorScheduleTimeZone={mirrorEntry ? getOneTimeWindowTimeZone(updatePolicy, mirrorEntry.schedule) : undefined}
      label={mirrorEntry ? t('Download and update timezone') : undefined}
      isReadOnly={isReadOnly}
    />
  );

  const editableContent = (
    <Stack hasGutter>
      <StackItem>
        <DefaultHelperText helperText={helperText} />
      </StackItem>
      <StackItem>
        <FormGroup label={t('Date')} isRequired>
          <CalendarDateField
            name={`${getWindowFieldPrefix(firstEntry)}.date`}
            isRequired
            isDisabled={isReadOnly}
            disablePastDates
            onDateChange={entries.length > 1 ? syncGroupedDate : undefined}
          />
        </FormGroup>
      </StackItem>

      {isMixed && (
        <StackItem>
          <Checkbox
            id={`one-time-window-${firstEntry.window.id}-split`}
            label={t('Use different schedules for downloading and installing')}
            isChecked={isSplit}
            isDisabled={isReadOnly}
            onChange={(_, checked) => setSplit(checked)}
          />
        </StackItem>
      )}

      {editableEntries.map((entry) => {
        const fieldPrefix = getWindowFieldPrefix(entry);

        return (
          <StackItem key={entry.window.id}>
            <Stack hasGutter>
              <StackItem>
                <FormGroup
                  label={
                    isSplit
                      ? entry.schedule === 'install'
                        ? t('Update window')
                        : t('Download window')
                      : isMixed
                        ? t('Download and install window')
                        : entry.schedule === 'install'
                          ? t('Update window')
                          : t('Download window')
                  }
                  isRequired
                >
                  <TimePair
                    startName={`${fieldPrefix}.startsAt`}
                    startsAt={entry.window.startsAt}
                    startGraceDuration={entry.window.startGraceDuration}
                    isReadOnly={isReadOnly}
                    mirrorFieldPrefix={mirrorFieldPrefix}
                  />
                </FormGroup>
              </StackItem>
              <StackItem>
                <FormGroup
                  label={t('Start grace duration')}
                  fieldId={`textfield-${fieldPrefix}.startGraceDuration`}
                  isRequired
                >
                  <TextField
                    name={`${fieldPrefix}.startGraceDuration`}
                    isRequired
                    isDisabled={isReadOnly}
                    placeholder={t('e.g. 30m')}
                    onChangeCustom={
                      mirrorFieldPrefix
                        ? (value) => void setFieldValue(`${mirrorFieldPrefix}.startGraceDuration`, value)
                        : undefined
                    }
                  />
                </FormGroup>
              </StackItem>
              <OverlapAlert
                config={getScheduleTimeZoneConfig(updatePolicy, entry.schedule, entry.window)}
                entry={entry}
              />
            </Stack>
          </StackItem>
        );
      })}
      {(hasSharedWindowFields && downloadEntry ? [downloadEntry] : entries).map((entry) => (
        <StackItem key={'timezone-' + entry.window.id}>
          {renderTimeZone(entry, hasSharedWindowFields && entry.schedule === 'download' ? installEntry : undefined)}
        </StackItem>
      ))}
    </Stack>
  );

  return (
    <FormSection>
      <Split hasGutter>
        <SplitItem isFilled>
          <ExpandableFormCard
            title={title}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded((value) => !value)}
            expandLabel={t('Expand one-time window')}
            collapseLabel={t('Collapse one-time window')}
            headerActions={
              <Label isCompact variant="filled" color="blue">
                {headerChip}
              </Label>
            }
          >
            {editableContent}
          </ExpandableFormCard>
        </SplitItem>
        {!isReadOnly && (
          <SplitItem>
            <Button
              aria-label={t('Remove one-time window')}
              variant="link"
              isDanger
              icon={<MinusCircleIcon />}
              iconPosition="start"
              onClick={() => onRemove(entries)}
            />
          </SplitItem>
        )}
      </Split>
    </FormSection>
  );
};
const OneTimeWindowsSection = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const {
    values: { updatePolicy },
    setFieldValue,
  } = useFormikContext<FleetFormValues>();

  const schedules: OneTimeWindowSchedule[] = ['download', 'install'];
  const entries: OneTimeWindowEntry[] = [];
  let displayCounter = 0;
  schedules.forEach((schedule) => {
    getScheduleWindows(updatePolicy, schedule).forEach((window, index) => {
      if (
        !timeUtils.isOneTimeWindowExpired(
          window.date,
          window.startsAt,
          window.startGraceDuration,
          getOneTimeWindowTimeZone(updatePolicy, schedule, window),
        )
      ) {
        displayCounter += 1;
        entries.push({ schedule, window, index, displayIndex: displayCounter });
      }
    });
  });

  const windowGroups = timeUtils.groupOneTimeWindowEntries(entries);

  const removeWindows = (items: RemovableWindow[]) => {
    schedules.forEach((schedule) => {
      const removedIds = new Set(items.filter((item) => item.schedule === schedule).map((item) => item.window.id));
      if (!removedIds.size) {
        return;
      }
      const fieldName = `updatePolicy.${schedule === 'install' ? 'installOneTimeWindows' : 'downloadOneTimeWindows'}`;
      void setFieldValue(
        fieldName,
        getScheduleWindows(updatePolicy, schedule).filter((window) => !removedIds.has(window.id)),
      );
    });
  };

  return (
    <>
      {windowGroups.map((group) => (
        <OneTimeWindowCard
          key={group[0].window.id}
          entries={group}
          isReadOnly={isReadOnly}
          onRemove={removeWindows}
        />
      ))}

      {schedules.map((schedule) => {
        const expiredWindows = getScheduleWindows(updatePolicy, schedule).filter((window) =>
          timeUtils.isOneTimeWindowExpired(
            window.date,
            window.startsAt,
            window.startGraceDuration,
            getOneTimeWindowTimeZone(updatePolicy, schedule, window),
          ),
        );
        if (!expiredWindows.length) {
          return null;
        }
        return (
          <details key={schedule} className="fctl-one-time-windows__past" open>
            <summary>
              {schedule === 'install'
                ? t('Past update windows ({{ total }})', { total: expiredWindows.length })
                : t('Past download windows ({{ total }})', { total: expiredWindows.length })}
            </summary>
            <ul className="fctl-one-time-windows__past-list">
              {expiredWindows.map((window) => (
                <li key={window.id} className="fctl-one-time-windows__expired">
                  <span>
                    {getCalendarDateDisplay(window.date)} · {timeUtils.getOneTimeWindowTimeText(window)} ·{' '}
                    {getOneTimeWindowTimeZone(updatePolicy, schedule, window) === timeUtils.localDeviceTimezone
                      ? t('device local')
                      : getOneTimeWindowTimeZone(updatePolicy, schedule, window)}
                  </span>
                  <span className="fctl-one-time-windows__expired-actions">
                    <span className="fctl-one-time-windows__expired-label">{t('Expired')}</span>
                    {!isReadOnly && (
                      <Button
                        variant="link"
                        isDanger
                        isInline
                        aria-label={t('Remove expired one-time window')}
                        onClick={() => removeWindows([{ schedule, window }])}
                      >
                        {t('Remove')}
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </>
  );
};

export default OneTimeWindowsSection;
