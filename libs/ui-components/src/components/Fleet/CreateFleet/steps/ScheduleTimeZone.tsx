import * as React from 'react';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { useField } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import useTimeZones from '../../../../hooks/useTimeZones';
import * as timeUtils from '../../../../utils/time';
import { DefaultHelperText } from '../../../form/FieldHelperText';
import FormSelectTypeahead from '../../../form/FormSelectTypeahead';

export enum ScheduleBlockType {
  Download = 'download',
  Install = 'install',
}

const getIdAndFieldName = (blockType: ScheduleBlockType, idSuffix?: string | number) => {
  const fieldName = `updatePolicy.${blockType}TimeZone`;
  const id = idSuffix === undefined ? fieldName : `${fieldName}-${idSuffix}`;
  return { fieldName, id };
};

export const ReadOnlyScheduleTimeZone = ({
  blockType,
  helperText,
}: {
  blockType: ScheduleBlockType;
  helperText?: string;
}) => {
  const { t } = useTranslation();
  const { fieldName } = getIdAndFieldName(blockType, '');
  const [{ value: timeZone }] = useField<string>({
    name: fieldName,
  });

  const timeZoneLabel =
    timeZone && timeZone !== timeUtils.localDeviceTimezone ? timeZone : t("Device's local timezone");
  return (
    <div>
      {t('Selected timezone: {{timeZone}}', { timeZone: timeZoneLabel })}
      {helperText && (
        <div>
          <small>{helperText}</small>
        </div>
      )}
    </div>
  );
};

type ScheduleTimeZoneProps = {
  blockType: ScheduleBlockType;
  helperText?: React.ReactNode;
  idSuffix?: string | number;
};

const ScheduleTimeZone = ({ blockType, helperText, idSuffix }: ScheduleTimeZoneProps) => {
  const { t } = useTranslation();

  const { fieldName, id } = getIdAndFieldName(blockType, idSuffix);
  const [{ value: timeZone, ...rest }, , { setValue }] = useField<string>({
    name: fieldName,
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

      {timeZone !== timeUtils.localDeviceTimezone && (
        <FormSelectTypeahead name={fieldName} defaultId="" items={zones} />
      )}

      <DefaultHelperText helperText={helperText} />
    </FormGroup>
  );
};

export default ScheduleTimeZone;
