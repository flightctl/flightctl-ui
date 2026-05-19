import * as React from 'react';
import { TFunction } from 'react-i18next';
import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  Icon,
  InputGroupText,
  Stack,
  StackItem,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { DEVICE_LOG_BASE_PATH, DeviceLogCategory, DeviceLogSearchParams } from '../../../utils/deviceLogs';
import FormSelect from '../../form/FormSelect';
import DeviceLogsPriorityField from './DeviceLogsLevelField';
import DeviceLogsTimeRangeField from './DeviceLogsTimeRangeField';

const getCategoryItems = (t: TFunction) => ({
  [DeviceLogCategory.AGENT]: t('Agent'),
  [DeviceLogCategory.SYSTEM]: t('System'),
  [DeviceLogCategory.FILE]: t('File path'),
});

export type DeviceLogsToolbarProps = {
  onLogTypeChange: VoidFunction;
};

const DeviceLogsToolbar = ({ onLogTypeChange }: DeviceLogsToolbarProps) => {
  const { t } = useTranslation();
  const { submitForm, isSubmitting, values, errors } = useFormikContext<DeviceLogSearchParams>();
  const [logFilePathField, logFilePathMeta, { setValue: setLogFilePathValue, setTouched: setLogFilePathTouched }] =
    useField({ name: 'logFilePath' });
  const [systemdUnitField, systemdUnitMeta, { setValue: setSystemdUnitValue }] = useField({ name: 'systemdUnit' });

  const hasSystemdUnitError = Boolean(systemdUnitMeta.error);
  const hasLogFilePathError = Boolean(logFilePathMeta.error);
  const isSubmitDisabled = isSubmitting || Object.keys(errors).length > 0;

  const categoryItems = React.useMemo(() => getCategoryItems(t), [t]);

  return (
    <Stack>
      <StackItem>
        <Toolbar
          id="device-logs-viewer-toolbar"
          ouiaId="device-logs-viewer-toolbar"
          inset={{ default: 'insetNone' }}
          isStatic
        >
          <ToolbarContent rowWrap={{ default: 'nowrap' }} alignItems="center">
            <ToolbarGroup>
              <ToolbarItem>
                <Flex
                  spaceItems={{ default: 'spaceItemsMd' }}
                  alignItems={{ default: 'alignItemsFlexEnd' }}
                  flexWrap={{ default: 'nowrap' }}
                >
                  <FlexItem>
                    <FormSelect
                      name="category"
                      items={categoryItems}
                      onChange={(newCategory) => {
                        if (newCategory === values.category) {
                          return;
                        }
                        if (newCategory === DeviceLogCategory.FILE) {
                          void setLogFilePathValue('');
                          void setLogFilePathTouched(false);
                        }
                        onLogTypeChange();
                      }}
                    />
                  </FlexItem>
                  {values.category === DeviceLogCategory.SYSTEM && (
                    <FlexItem style={{ minWidth: '12rem' }}>
                      <FormGroup id="form-control__systemdUnit" fieldId="systemdUnit">
                        <TextInput
                          {...systemdUnitField}
                          id="systemdUnit"
                          aria-label={t('Systemd unit')}
                          placeholder={t('e.g. sshd.service')}
                          onChange={async (_, value) => {
                            await setSystemdUnitValue(value);
                          }}
                          validated={hasSystemdUnitError ? 'error' : 'default'}
                        />
                      </FormGroup>
                    </FlexItem>
                  )}
                  {values.category !== DeviceLogCategory.FILE && (
                    <FlexItem>
                      <DeviceLogsTimeRangeField />
                    </FlexItem>
                  )}
                  {values.category !== DeviceLogCategory.FILE && (
                    <FlexItem>
                      <DeviceLogsPriorityField />
                    </FlexItem>
                  )}

                  {values.category === DeviceLogCategory.FILE && (
                    <>
                      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                        <InputGroupText>{DEVICE_LOG_BASE_PATH}</InputGroupText>
                      </FlexItem>
                      <FlexItem>
                        <FormGroup id="form-control__logFilePath" fieldId="textfield-logFilePath">
                          <TextInput
                            {...logFilePathField}
                            id="textfield-logFilePath"
                            type="text"
                            aria-label={t('Log file path')}
                            placeholder={t('Relative file path')}
                            validated={hasLogFilePathError && logFilePathMeta.touched ? 'error' : 'default'}
                            onChange={async (_, value) => {
                              await setLogFilePathValue(value);
                              await setLogFilePathTouched(true);
                            }}
                          />
                        </FormGroup>
                      </FlexItem>
                    </>
                  )}
                </Flex>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup variant="action-group" align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                <Button
                  variant="primary"
                  onClick={() => void submitForm()}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitDisabled}
                >
                  {t('Retrieve logs')}
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </StackItem>
      <StackItem>
        {(hasLogFilePathError || hasSystemdUnitError) && (
          <>
            <Icon status="danger">
              <ExclamationCircleIcon />
            </Icon>{' '}
            <span className="pf-v6-u-font-weight-bold">{logFilePathMeta.error || systemdUnitMeta.error || ''}</span>
          </>
        )}
      </StackItem>
    </Stack>
  );
};

export default DeviceLogsToolbar;
