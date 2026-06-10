import * as React from 'react';
import {
  Divider,
  Flex,
  FlexItem,
  FormGroup,
  MenuToggle,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { useField } from 'formik';
import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceLogLevel, DeviceLogLevelValue, getDeviceLogLevelLabel } from '../../../utils/deviceLogs';

const fieldIdToggle = 'device-logs-level-toggle';

const DeviceLogsLevelField = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = React.useState(false);
  const [{ value: level }, , { setValue, setTouched }] = useField<DeviceLogLevelValue>({ name: 'level' });

  const onLevelSelected = React.useCallback(
    (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
      void setValue(value as DeviceLogLevelValue);
      void setTouched(true);
      setIsOpen(false);
    },
    [setValue, setTouched],
  );

  return (
    <FormGroup id="form-control__device-logs-level" fieldId={fieldIdToggle}>
      <Flex
        spaceItems={{ default: 'spaceItemsMd' }}
        alignItems={{ default: 'alignItemsFlexEnd' }}
        flexWrap={{ default: 'wrap' }}
      >
        <FlexItem>
          <Select
            id="device-logs-level"
            selected={level}
            onSelect={onLevelSelected}
            shouldFocusToggleOnSelect
            isOpen={isOpen}
            style={{ width: '12rem' }}
            onOpenChange={(open) => {
              if (!open) {
                void setTouched(true);
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
                aria-label={t('Level')}
                style={{ minWidth: '12rem' }}
              >
                {level === 'all' ? t('All levels') : getDeviceLogLevelLabel(t, level)}
              </MenuToggle>
            )}
          >
            <SelectGroup>
              <SelectList>
                {Object.values(DeviceLogLevel).map((lvl) => (
                  <SelectOption key={lvl} value={lvl} isSelected={level === lvl}>
                    {getDeviceLogLevelLabel(t, lvl)}
                  </SelectOption>
                ))}
              </SelectList>
            </SelectGroup>
            <Divider />
            <SelectGroup>
              <SelectList>
                <SelectOption
                  value="all"
                  isSelected={level === 'all'}
                  description={t('Returns all log entries including those without a priority set.')}
                >
                  {t('All levels')}
                </SelectOption>
              </SelectList>
            </SelectGroup>
          </Select>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default DeviceLogsLevelField;
