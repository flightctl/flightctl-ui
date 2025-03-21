import * as React from 'react';
import { Checkbox, Flex, FlexItem, FormGroup, Stack, StackItem, Weekday } from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import useTimeZones from '../../../../hooks/useTimeZones';
import * as timeUtils from '../../../../utils/time';
import { FleetFormValues, UpdatePolicyForm } from '../../../../types/deviceSpec';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import CheckboxField, { CheckboxFieldGroupValidation } from '../../../form/CheckboxField';
import FormSelectTypeahead from '../../../form/FormSelectTypeahead';
import RadioField from '../../../form/RadioField';
import ErrorHelperText from '../../../form/FieldHelperText';

import './UpdateStepUpdatePolicy.css';

export enum ScheduleBlockType {
  Download = 'download',
  Install = 'install',
}

type ScheduleBlockProps = {
  updatePolicy: UpdatePolicyForm;
  blockType: ScheduleBlockType;
  weekDayError?: string[] | string | Weekday;
  onScheduleModeSwitch: (blockType: ScheduleBlockType) => void;
};

const ScheduleTimeZone = ({ blockType }: { blockType: ScheduleBlockType }) => {
  const { t } = useTranslation();

  const id = `updatePolicy.${blockType}TimeZone`;

  const [{ value: timeZone, ...rest }, , { setValue }] = useField<string>({
    name: id,
  });

  const zones = useTimeZones();

  const onChangeTimezoneCheckbox = (_, isChecked: boolean) => {
    setValue(isChecked ? timeUtils.localDeviceTimezone : '');
  };

  return (
    <FormGroup id={`form-control__${id}`} fieldId={id} isStack className="fctl-policy-timezone">
      <Checkbox
        {...rest}
        isChecked={timeZone === timeUtils.localDeviceTimezone}
        id={id}
        onChange={onChangeTimezoneCheckbox}
        label={t("Use device's local timezone")}
      />

      {timeZone !== timeUtils.localDeviceTimezone && <FormSelectTypeahead name={id} defaultId="" items={zones} />}
    </FormGroup>
  );
};

const ScheduleBlock = ({ blockType, updatePolicy, onScheduleModeSwitch, weekDayError }: ScheduleBlockProps) => {
  const { t } = useTranslation();

  let ariaLabel: string;
  let helperContent: string;

  switch (blockType) {
    case ScheduleBlockType.Download:
      {
        if (updatePolicy.downloadAndInstallDiffer) {
          ariaLabel = t('Downloading schedule');
          helperContent = t('Time frame during which devices can start downloading their new configurations.');
        } else {
          ariaLabel = t('Downloading and installing schedule');
          helperContent = t(
            'Time frame during which devices can start downloading and installing their new configurations.',
          );
        }
      }

      break;
    case ScheduleBlockType.Install:
      ariaLabel = t('Installing schedule');
      helperContent = t('Time frame during which devices can start installing their new configurations.');
      break;
  }

  const selectableTimes = React.useMemo(() => timeUtils.getSelectableTimes(), []);

  const isValidTypedItem = React.useCallback((value: string) => timeUtils.valid24HourClockRegExp.test(value), []);

  const transformTypedItem = React.useCallback((time: string) => {
    if (timeUtils.formatted24HourClockRegExp.test(time)) {
      return time;
    }

    // We "fix" the value when it misses the optional leading 0, or the semicolon
    // The value is known to be valid at this point, so there should always be a match.
    const match = time.match(/^(\d{1,2})?:?(\d{2})?$/);
    return match ? `${timeUtils.formatTimePart(match[1])}:${match[2]}` : timeUtils.defaultStartTime;
  }, []);

  const scheduleMode =
    blockType === ScheduleBlockType.Download ? updatePolicy.downloadScheduleMode : updatePolicy.installScheduleMode;
  const isWeekly = scheduleMode === timeUtils.UpdateScheduleMode.Weekly;

  return (
    <FormGroupWithHelperText isRequired label={ariaLabel} content={helperContent}>
      <Stack hasGutter>
        <StackItem>
          <Flex>
            <FlexItem>
              <FormSelectTypeahead
                name={`updatePolicy.${blockType}StartsAt`}
                placeholderText={t('hh:mm', { nsSeparator: '|' })}
                defaultId={timeUtils.defaultStartTime}
                items={selectableTimes}
                isValidTypedItem={isValidTypedItem}
                transformTypedItem={transformTypedItem}
              />
            </FlexItem>
            <FlexItem>
              <FormSelectTypeahead
                name={`updatePolicy.${blockType}EndsAt`}
                placeholderText={t('hh:mm', { nsSeparator: '|' })}
                defaultId={timeUtils.defaultEndTime}
                items={selectableTimes}
                isValidTypedItem={isValidTypedItem}
                transformTypedItem={transformTypedItem}
              />
            </FlexItem>
            <FlexItem>
              <RadioField
                id={`daily-${blockType}`}
                name={`updatePolicy.${blockType}ScheduleMode`}
                label={t('Daily')}
                checkedValue={timeUtils.UpdateScheduleMode.Daily}
              />
            </FlexItem>
            <FlexItem>
              <RadioField
                id={`weekly-${blockType}`}
                name={`updatePolicy.${blockType}ScheduleMode`}
                label={t('Weekly')}
                checkedValue={timeUtils.UpdateScheduleMode.Weekly}
                onChangeCustom={() => onScheduleModeSwitch(blockType)}
              />
            </FlexItem>
          </Flex>
        </StackItem>
        {isWeekly && (
          <FieldArray name={`updatePolicy.${blockType}WeekDays`}>
            {() => (
              <>
                <StackItem>
                  <Flex>
                    <FlexItem>
                      <CheckboxFieldGroupValidation name={`updatePolicy.${blockType}WeekDays[0]`} label={t('Sun')} />
                    </FlexItem>
                    <FlexItem>
                      <CheckboxFieldGroupValidation name={`updatePolicy.${blockType}WeekDays[1]`} label={t('Mon')} />
                    </FlexItem>
                    <FlexItem>
                      <CheckboxFieldGroupValidation name={`updatePolicy.${blockType}WeekDays[2]`} label={t('Tue')} />
                    </FlexItem>
                    <FlexItem>
                      <CheckboxFieldGroupValidation name={`updatePolicy.${blockType}WeekDays[3]`} label={t('Wed')} />
                    </FlexItem>
                    <FlexItem>
                      <CheckboxFieldGroupValidation name={`updatePolicy.${blockType}WeekDays[4]`} label={t('Thu')} />
                    </FlexItem>
                    <FlexItem>
                      <CheckboxFieldGroupValidation name={`updatePolicy.${blockType}WeekDays[5]`} label={t('Fri')} />
                    </FlexItem>
                    <FlexItem>
                      <CheckboxFieldGroupValidation name={`updatePolicy.${blockType}WeekDays[6]`} label={t('Sat')} />
                    </FlexItem>
                  </Flex>
                </StackItem>
                <StackItem>
                  <ErrorHelperText error={weekDayError} />
                </StackItem>
              </>
            )}
          </FieldArray>
        )}
        <StackItem style={{ maxWidth: 500 }}>
          <ScheduleTimeZone blockType={blockType} />
        </StackItem>
      </Stack>
    </FormGroupWithHelperText>
  );
};

const UpdateStepUpdatePolicy = () => {
  const { t } = useTranslation();

  const {
    values: { updatePolicy },
    errors,
    setFieldValue,
  } = useFormikContext<FleetFormValues>();

  // When switching to "daily" mode, we keep the selected weekdays, as they will be ignored.
  // By doing this, if users switch to "weekly" again, we can show the weekdays they selected previously instead of all/none
  const onSwitchToWeeklyMode = (blockType: ScheduleBlockType) => {
    const selectedDays =
      blockType === ScheduleBlockType.Download ? updatePolicy.downloadWeekDays : updatePolicy.installWeekDays;

    const isAllWeekSelected = selectedDays.every(Boolean);
    if (isAllWeekSelected) {
      setFieldValue(`updatePolicy.${blockType}WeekDays`, [false, false, false, false, false, false, false]);
    }
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <CheckboxField
          label={t('Use different update schedules for downloading and installing updates')}
          name="updatePolicy.downloadAndInstallDiffer"
        />
      </StackItem>

      <StackItem>
        <ScheduleBlock
          blockType={ScheduleBlockType.Download}
          updatePolicy={updatePolicy}
          weekDayError={errors.updatePolicy?.downloadWeekDays}
          onScheduleModeSwitch={onSwitchToWeeklyMode}
        />
      </StackItem>

      {updatePolicy.downloadAndInstallDiffer && (
        <StackItem>
          <ScheduleBlock
            blockType={ScheduleBlockType.Install}
            updatePolicy={updatePolicy}
            weekDayError={errors.updatePolicy?.installWeekDays}
            onScheduleModeSwitch={onSwitchToWeeklyMode}
          />
        </StackItem>
      )}
    </Stack>
  );
};

export default UpdateStepUpdatePolicy;
