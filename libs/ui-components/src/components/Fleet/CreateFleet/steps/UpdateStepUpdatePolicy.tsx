import * as React from 'react';
import {
  Alert,
  Button,
  CodeBlock,
  CodeBlockCode,
  Content,
  Divider,
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
  type Weekday,
} from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import type { TFunction } from 'i18next';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { useTranslation } from '../../../../hooks/useTranslation';
import * as timeUtils from '../../../../utils/time';
import { type FleetFormValues, type UpdatePolicyForm } from '../../../../types/deviceSpec';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import CheckboxField, { CheckboxFieldGroupValidation } from '../../../form/CheckboxField';
import FormSelectTypeahead from '../../../form/FormSelectTypeahead';
import RadioField from '../../../form/RadioField';
import TextField from '../../../form/TextField';
import ErrorHelperText, { DefaultHelperText } from '../../../form/FieldHelperText';
import { getOneTimeWindowTimeZone, getUpdatePolicyValues } from '../fleetSpecUtils';
import ExpandableFormCard from './ExpandableFormCard';
import OneTimeWindowsSection from './OneTimeWindowsSection';
import ScheduleTimeZone, { ReadOnlyScheduleTimeZone, ScheduleBlockType } from './ScheduleTimeZone';

import './UpdateStepUpdatePolicy.css';

/** Frequency + weekdays for one schedule block. */
const BlockFrequencyFields = ({
  blockType,
  updatePolicy,
  isReadOnly,
  weekDayError,
}: {
  blockType: ScheduleBlockType;
  updatePolicy: UpdatePolicyForm;
  isReadOnly?: boolean;
  weekDayError?: string[] | string | Weekday;
}) => {
  const { t } = useTranslation();
  const { setFieldValue } = useFormikContext<FleetFormValues>();

  const modeName =
    blockType === ScheduleBlockType.Download ? 'updatePolicy.downloadScheduleMode' : 'updatePolicy.installScheduleMode';
  const weekDaysName =
    blockType === ScheduleBlockType.Download ? 'updatePolicy.downloadWeekDays' : 'updatePolicy.installWeekDays';
  const scheduleMode =
    blockType === ScheduleBlockType.Download ? updatePolicy.downloadScheduleMode : updatePolicy.installScheduleMode;
  const isWeekly = scheduleMode === timeUtils.UpdateScheduleMode.Weekly;
  const isDiffer = updatePolicy.downloadAndInstallDiffer;
  const selectedDays =
    (blockType === ScheduleBlockType.Download ? updatePolicy.downloadWeekDays : updatePolicy.installWeekDays) || [];

  const onSelectMode = (mode: unknown) => {
    if (!isDiffer) {
      setFieldValue('updatePolicy.installScheduleMode', mode);
    }
    if (mode === timeUtils.UpdateScheduleMode.Weekly && selectedDays.every(Boolean)) {
      const cleared = [false, false, false, false, false, false, false];
      setFieldValue(weekDaysName, cleared);
      if (!isDiffer) {
        setFieldValue('updatePolicy.installWeekDays', cleared);
      }
    }
  };

  return (
    <Stack hasGutter className="fctl-recurring-schedule__decisions">
      <StackItem>
        <FormGroupWithHelperText
          isRequired
          label={t('Frequency')}
          content={t('How often this window repeats. Choose weekly to pick specific days.')}
        >
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapMd' }}
            className="fctl-recurring-schedule__frequency"
          >
            <FlexItem>
              <RadioField
                id={`${blockType}-frequency-daily`}
                name={modeName}
                label={t('Daily')}
                checkedValue={timeUtils.UpdateScheduleMode.Daily}
                onChangeCustom={onSelectMode}
                isDisabled={isReadOnly}
              />
            </FlexItem>
            <FlexItem>
              <RadioField
                id={`${blockType}-frequency-weekly`}
                name={modeName}
                label={t('Weekly')}
                checkedValue={timeUtils.UpdateScheduleMode.Weekly}
                onChangeCustom={onSelectMode}
                isDisabled={isReadOnly}
              />
            </FlexItem>
          </Flex>
        </FormGroupWithHelperText>
      </StackItem>

      {isWeekly && (
        <StackItem>
          <FormGroupWithHelperText
            isRequired
            label={t('Days of the week')}
            content={t('Updates may start on the selected days during the time window below.')}
          >
            <FieldArray name={weekDaysName}>
              {() => (
                <>
                  <Flex
                    gap={{ default: 'gapMd' }}
                    flexWrap={{ default: 'wrap' }}
                    className="fctl-recurring-schedule__weekdays"
                  >
                    {([t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')] as const).map(
                      (label, dayIndex) => (
                        <FlexItem key={label}>
                          <CheckboxFieldGroupValidation
                            name={`${weekDaysName}[${dayIndex}]`}
                            label={label}
                            onChangeCustom={(checked) => {
                              if (!isDiffer) {
                                setFieldValue(`updatePolicy.installWeekDays[${dayIndex}]`, checked);
                              }
                            }}
                            isDisabled={isReadOnly}
                          />
                        </FlexItem>
                      ),
                    )}
                  </Flex>
                  <ErrorHelperText error={weekDayError} />
                </>
              )}
            </FieldArray>
          </FormGroupWithHelperText>
        </StackItem>
      )}
    </Stack>
  );
};

type ScheduleBlockProps = {
  updatePolicy: UpdatePolicyForm;
  blockType: ScheduleBlockType;
  weekDayError?: string[] | string | Weekday;
  isReadOnly?: boolean;
};

const ScheduleBlock = ({ blockType, updatePolicy, weekDayError, isReadOnly }: ScheduleBlockProps) => {
  const { t } = useTranslation();
  const { setFieldValue } = useFormikContext<FleetFormValues>();

  let ariaLabel: string;
  let helperContent: string;

  switch (blockType) {
    case ScheduleBlockType.Download:
      {
        if (updatePolicy.downloadAndInstallDiffer) {
          ariaLabel = t('Downloading window');
          helperContent = t(
            'When devices may start downloading. Work already in progress can finish after this window ends.',
          );
        } else {
          ariaLabel = t('Time window');
          helperContent = t(
            'When devices may start downloading and installing. Work already in progress can finish after this window ends.',
          );
        }
      }

      break;
    case ScheduleBlockType.Install:
      ariaLabel = t('Installing window');
      helperContent = t(
        'When devices may start installing. Work already in progress can finish after this window ends.',
      );
      break;
  }

  const selectableTimes = React.useMemo(() => timeUtils.getSelectableTimes(), []);

  const isValidTypedItem = React.useCallback((value: string) => timeUtils.valid24HourClockRegExp.test(value), []);

  const transformTypedItem = React.useCallback((time: string) => {
    if (timeUtils.formatted24HourClockRegExp.test(time)) {
      return time;
    }

    const match = time.match(/^(\d{1,2})?:?(\d{2})?$/);
    return match ? `${timeUtils.formatTimePart(match[1])}:${match[2]}` : timeUtils.defaultStartTime;
  }, []);

  const enableRecurringSchedule = () => {
    if (blockType === ScheduleBlockType.Download && !updatePolicy.downloadCron) {
      void setFieldValue('updatePolicy.downloadCron', timeUtils.getDefaultUpdateCron());
    }
    if (blockType === ScheduleBlockType.Install && !updatePolicy.installCron) {
      void setFieldValue('updatePolicy.installCron', timeUtils.getDefaultUpdateCron());
    }
  };

  const startsAt =
    blockType === ScheduleBlockType.Download ? updatePolicy.downloadStartsAt : updatePolicy.installStartsAt;
  const startGraceDuration =
    blockType === ScheduleBlockType.Download
      ? updatePolicy.downloadStartGraceDuration
      : updatePolicy.installStartGraceDuration;
  const derivedEnd = timeUtils.getEndTime(startsAt || timeUtils.defaultStartTime, startGraceDuration);

  return (
    <Stack hasGutter>
      <StackItem>
        <BlockFrequencyFields
          blockType={blockType}
          updatePolicy={updatePolicy}
          weekDayError={weekDayError}
          isReadOnly={isReadOnly}
        />
      </StackItem>
      <StackItem>
        <FormGroupWithHelperText isRequired label={ariaLabel} content={helperContent}>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            className="fctl-recurring-schedule__time-row"
          >
            <FlexItem>
              <FormSelectTypeahead
                name={`updatePolicy.${blockType}StartsAt`}
                placeholderText={t('Start (hh:mm)', { nsSeparator: '|' })}
                defaultId={timeUtils.defaultStartTime}
                items={selectableTimes}
                isValidTypedItem={isValidTypedItem}
                transformTypedItem={transformTypedItem}
                onChangeCustom={enableRecurringSchedule}
                isDisabled={isReadOnly}
              />
            </FlexItem>
            <FlexItem className="fctl-recurring-schedule__time-sep">{t('to')}</FlexItem>
            <FlexItem>
              <TextInput value={derivedEnd} isDisabled aria-label={t('End time')} />
            </FlexItem>
          </Flex>
        </FormGroupWithHelperText>
      </StackItem>
      <StackItem>
        <FormGroupWithHelperText
          isRequired
          label={t('Start grace duration')}
          content={t('How long after the start time devices may still begin. End time updates from start + grace.')}
        >
          <TextField
            name={`updatePolicy.${blockType}StartGraceDuration`}
            isRequired
            isDisabled={isReadOnly}
            placeholder={t('e.g. 30m')}
          />
        </FormGroupWithHelperText>
      </StackItem>
    </Stack>
  );
};
const getRecurringModeLabel = (updatePolicy: UpdatePolicyForm, t: TFunction) => {
  const getLabel = (mode: UpdatePolicyForm['downloadScheduleMode']) =>
    mode === timeUtils.UpdateScheduleMode.Weekly ? t('Weekly') : t('Daily');
  if (!updatePolicy.downloadCron && updatePolicy.installCron) {
    return getLabel(updatePolicy.installScheduleMode);
  }
  const downloadLabel = getLabel(updatePolicy.downloadScheduleMode);
  if (!updatePolicy.downloadAndInstallDiffer || !updatePolicy.installCron) {
    return downloadLabel;
  }
  const installLabel = getLabel(updatePolicy.installScheduleMode);
  return downloadLabel === installLabel ? downloadLabel : t('Mixed');
};

const UnsupportedCronBlock = ({
  label,
  at,
  startGraceDuration,
  timeZone,
}: {
  label: string;
  at: string;
  startGraceDuration?: string;
  timeZone?: string;
}) => {
  const { t } = useTranslation();
  const timeZoneLabel =
    !timeZone || timeZone === timeUtils.localDeviceTimezone ? t("device's local timezone") : timeZone;
  const grace = startGraceDuration && startGraceDuration !== '0s' ? startGraceDuration : undefined;

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup label={label}>
          <CodeBlock>
            <CodeBlockCode>{at}</CodeBlockCode>
          </CodeBlock>
        </FormGroup>
      </StackItem>
      <StackItem>
        <DefaultHelperText
          helperText={
            grace
              ? t('Timezone: {{ tz }}. Grace: {{ grace }}.', { tz: timeZoneLabel, grace })
              : t('Timezone: {{ tz }}.', { tz: timeZoneLabel })
          }
        />
      </StackItem>
    </Stack>
  );
};

const GlobalTimeZones = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  return (
    <FormSection>
      <Stack hasGutter>
        <StackItem>
          <Content component="h3">{t('Global timezones')}</Content>
          <DefaultHelperText
            helperText={t('Global timezones apply to recurring schedules and one-time windows that use them.')}
          />
        </StackItem>
        <StackItem>
          <Content component="h4">{t('Download timezone')}</Content>
          {isReadOnly ? (
            <ReadOnlyScheduleTimeZone blockType={ScheduleBlockType.Download} />
          ) : (
            <ScheduleTimeZone blockType={ScheduleBlockType.Download} />
          )}
        </StackItem>
        <StackItem>
          <Content component="h4">{t('Update timezone')}</Content>
          {isReadOnly ? (
            <ReadOnlyScheduleTimeZone blockType={ScheduleBlockType.Install} />
          ) : (
            <ScheduleTimeZone blockType={ScheduleBlockType.Install} />
          )}
        </StackItem>
      </Stack>
    </FormSection>
  );
};

const RecurringScheduleCard = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const {
    values: { updatePolicy },
    errors,
    setFieldValue,
  } = useFormikContext<FleetFormValues>();

  const [isExpanded, setIsExpanded] = React.useState(true);

  const hasDownload = Boolean(updatePolicy.downloadCron);
  const hasInstall = Boolean(updatePolicy.installCron);
  if (!hasDownload && !hasInstall) {
    return null;
  }

  // Without split schedules the install cron is absent by design (it shares the download one).
  const hasOnlyOneSide = updatePolicy.downloadAndInstallDiffer && hasDownload !== hasInstall;
  const downloadUnsupported = hasDownload && !timeUtils.isUiSupportedCron(updatePolicy.downloadCron);
  const installUnsupported = hasInstall && !timeUtils.isUiSupportedCron(updatePolicy.installCron);
  const hasUnsupportedCron = downloadUnsupported || installUnsupported;
  const recurringReadOnly = hasOnlyOneSide || hasUnsupportedCron;

  const clearRecurring = () => {
    const downloadTimeZone = getOneTimeWindowTimeZone(updatePolicy, 'download');
    const installTimeZone = getOneTimeWindowTimeZone(updatePolicy, 'install');
    void setFieldValue('updatePolicy', {
      ...getUpdatePolicyValues(undefined),
      isCustomized: updatePolicy.isCustomized,
      downloadAndInstallDiffer: updatePolicy.installOneTimeWindows.length > 0 && installTimeZone !== downloadTimeZone,
      downloadOneTimeWindows: updatePolicy.downloadOneTimeWindows,
      installOneTimeWindows: updatePolicy.installOneTimeWindows,
      downloadTimeZone,
      installTimeZone,
    });
    setIsExpanded(false);
  };

  return (
    <FormSection>
      <Split hasGutter>
        <SplitItem isFilled>
          <ExpandableFormCard
            title={t('Recurring schedule')}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded((value) => !value)}
            expandLabel={t('Expand recurring schedule')}
            collapseLabel={t('Collapse recurring schedule')}
            headerActions={
              <Label isCompact variant="filled" color="purple">
                {hasUnsupportedCron ? t('Custom') : getRecurringModeLabel(updatePolicy, t)}
              </Label>
            }
          >
            {recurringReadOnly ? (
              <Stack hasGutter>
                <StackItem>
                  <Alert variant="info" isInline title={t('Recurring schedule (read-only)')}>
                    {hasUnsupportedCron
                      ? t(
                          'This recurring schedule uses values that is neither Daily nor Weekly. It is read-only. Remove it here, or edit the fleet YAML.',
                        )
                      : t(
                          'The recurring schedule has only one of the download and update windows and it cannot be managed by the UI. Remove it here, or edit the fleet YAML.',
                        )}
                  </Alert>
                </StackItem>
                {hasDownload && (
                  <StackItem>
                    {downloadUnsupported ? (
                      <UnsupportedCronBlock
                        label={hasInstall ? t('Download schedule (cron)') : t('Recurring schedule')}
                        at={updatePolicy.downloadCron || ''}
                        startGraceDuration={updatePolicy.downloadStartGraceDuration}
                        timeZone={updatePolicy.downloadTimeZone}
                      />
                    ) : (
                      <ScheduleBlock
                        blockType={ScheduleBlockType.Download}
                        updatePolicy={updatePolicy}
                        weekDayError={errors.updatePolicy?.downloadWeekDays}
                        isReadOnly
                      />
                    )}
                  </StackItem>
                )}
                {hasDownload && hasInstall && <Divider />}
                {hasInstall && (
                  <StackItem>
                    {installUnsupported ? (
                      <UnsupportedCronBlock
                        label={t('Install schedule (cron)')}
                        at={updatePolicy.installCron || ''}
                        startGraceDuration={updatePolicy.installStartGraceDuration}
                        timeZone={updatePolicy.installTimeZone}
                      />
                    ) : (
                      <ScheduleBlock
                        blockType={ScheduleBlockType.Install}
                        updatePolicy={updatePolicy}
                        weekDayError={errors.updatePolicy?.installWeekDays}
                        isReadOnly
                      />
                    )}
                  </StackItem>
                )}
              </Stack>
            ) : (
              <Stack hasGutter>
                <StackItem>
                  <CheckboxField
                    label={t('Use different update schedules for downloading and installing updates')}
                    name="updatePolicy.downloadAndInstallDiffer"
                    isDisabled={isReadOnly}
                    onChangeCustom={(isDiffer) => {
                      if (!isDiffer) {
                        return;
                      }
                      void setFieldValue('updatePolicy.installCron', updatePolicy.downloadCron);
                      void setFieldValue('updatePolicy.installStartsAt', updatePolicy.downloadStartsAt);
                      void setFieldValue(
                        'updatePolicy.installStartGraceDuration',
                        updatePolicy.downloadStartGraceDuration,
                      );
                      void setFieldValue('updatePolicy.installScheduleMode', updatePolicy.downloadScheduleMode);
                      void setFieldValue('updatePolicy.installWeekDays', [...updatePolicy.downloadWeekDays]);
                    }}
                  />
                </StackItem>
                <StackItem>
                  <ScheduleBlock
                    blockType={ScheduleBlockType.Download}
                    updatePolicy={updatePolicy}
                    weekDayError={errors.updatePolicy?.downloadWeekDays}
                    isReadOnly={isReadOnly}
                  />
                </StackItem>
                {updatePolicy.downloadAndInstallDiffer && (
                  <>
                    <Divider />
                    <StackItem>
                      <ScheduleBlock
                        blockType={ScheduleBlockType.Install}
                        updatePolicy={updatePolicy}
                        weekDayError={errors.updatePolicy?.installWeekDays}
                        isReadOnly={isReadOnly}
                      />
                    </StackItem>
                  </>
                )}
              </Stack>
            )}
          </ExpandableFormCard>
        </SplitItem>
        {!isReadOnly && (
          <SplitItem>
            <Button
              aria-label={t('Remove recurring schedule')}
              variant="link"
              isDanger
              icon={<MinusCircleIcon />}
              iconPosition="start"
              onClick={clearRecurring}
            />
          </SplitItem>
        )}
      </Split>
    </FormSection>
  );
};

const UpdateStepUpdatePolicy = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const {
    values: { updatePolicy },
    setFieldValue,
  } = useFormikContext<FleetFormValues>();

  const hasRecurring = timeUtils.hasRecurringSchedule(updatePolicy);
  const oneTimeWindows = [
    ...(updatePolicy.downloadOneTimeWindows || []).map((window) => ({
      window,
      timeZone: getOneTimeWindowTimeZone(updatePolicy, 'download', window),
    })),
    ...(updatePolicy.installOneTimeWindows || []).map((window) => ({
      window,
      timeZone: getOneTimeWindowTimeZone(updatePolicy, 'install', window),
    })),
  ];
  const hasActiveOneTimeWindows = oneTimeWindows.some(
    ({ window, timeZone }) =>
      !timeUtils.isOneTimeWindowExpired(window.date, window.startsAt, window.startGraceDuration, timeZone),
  );

  const addRecurring = () => {
    const startsAt = updatePolicy.downloadStartsAt || timeUtils.defaultStartTime;
    void setFieldValue('updatePolicy.downloadCron', timeUtils.getDefaultUpdateCron());
    void setFieldValue('updatePolicy.downloadStartGraceDuration', '30m');
    void setFieldValue('updatePolicy.installCron', timeUtils.getDefaultUpdateCron());
    void setFieldValue('updatePolicy.installStartsAt', startsAt);
    void setFieldValue('updatePolicy.installStartGraceDuration', '30m');
  };

  const addOneTimeWindow = () => {
    void setFieldValue('updatePolicy.downloadOneTimeWindows', [
      ...(updatePolicy.downloadOneTimeWindows || []),
      timeUtils.createEmptyOneTimeWindow(),
    ]);
    void setFieldValue('updatePolicy.installOneTimeWindows', [
      ...(updatePolicy.installOneTimeWindows || []),
      timeUtils.createEmptyOneTimeWindow(),
    ]);
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <DefaultHelperText
          helperText={t(
            'Add a recurring Daily/Weekly window and/or one-time windows. Windows control when updates may start; work that has already started can finish afterward. Recurring is optional - remove it if you only need specific dates.',
          )}
        />
      </StackItem>

      <StackItem>
        <RecurringScheduleCard isReadOnly={isReadOnly} />
      </StackItem>

      <StackItem>
        <GlobalTimeZones isReadOnly={isReadOnly} />
      </StackItem>

      <StackItem>
        <OneTimeWindowsSection isReadOnly={isReadOnly} />
      </StackItem>

      {!isReadOnly && (
        <StackItem>
          <FormSection>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapMd' }}
              flexWrap={{ default: 'wrap' }}
            >
              {!hasRecurring && (
                <Button variant="secondary" icon={<PlusCircleIcon />} iconPosition="start" onClick={addRecurring}>
                  {t('Add recurring schedule')}
                </Button>
              )}
              <Button variant="link" icon={<PlusCircleIcon />} iconPosition="start" onClick={addOneTimeWindow}>
                {t('Add one-time window')}
              </Button>
            </Flex>
            {!hasRecurring && !hasActiveOneTimeWindows && (
              <DefaultHelperText
                helperText={t('No active maintenance windows yet. Add a recurring schedule or a one-time window.')}
              />
            )}
          </FormSection>
        </StackItem>
      )}
    </Stack>
  );
};

export default UpdateStepUpdatePolicy;
