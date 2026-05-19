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
import { useFormikContext } from 'formik';
import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceLogLevel, DeviceLogSearchParams, getDeviceLogLevelLabel } from '../../../utils/deviceLogs';

const fieldIdToggle = 'device-logs-level-toggle';

const DeviceLogsLevelField = () => {
  const { t } = useTranslation();
  const {
    values: { level },
    setFieldValue,
    setFieldTouched,
  } = useFormikContext<DeviceLogSearchParams>();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleText = getDeviceLogLevelLabel(t, level);

  const onLevelSelected = React.useCallback(
    (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
      void setFieldValue('level', value as DeviceLogLevel);
      void setFieldTouched('level', true);
      setIsOpen(false);
    },
    [setFieldTouched, setFieldValue],
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
            shouldFocusFirstItemOnOpen
            isOpen={isOpen}
            style={{ width: '12rem' }}
            onOpenChange={(open) => {
              if (!open) {
                void setFieldTouched('level', true);
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
                {toggleText}
              </MenuToggle>
            )}
          >
            <SelectGroup>
              <SelectList>
                {Object.values(DeviceLogLevel)
                  .filter((p) => p !== DeviceLogLevel.ALL)
                  .map((p) => (
                    <SelectOption key={p} value={p} isSelected={level === p}>
                      {getDeviceLogLevelLabel(t, p)}
                    </SelectOption>
                  ))}
              </SelectList>
            </SelectGroup>
            <Divider />
            <SelectGroup>
              <SelectList>
                <SelectOption
                  value={DeviceLogLevel.ALL}
                  isSelected={level === DeviceLogLevel.ALL}
                  description={t('Returns all log entries including those without a priority set.')}
                >
                  {t('All logs')}
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
