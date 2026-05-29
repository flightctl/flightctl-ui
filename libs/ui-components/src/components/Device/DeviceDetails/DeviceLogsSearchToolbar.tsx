import * as React from 'react';
import { TFunction } from 'react-i18next';
import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  InputGroupText,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import {
  DEVICE_LOGS_FORM_INITIAL_VALUES,
  DEVICE_LOG_BASE_PATH,
  DeviceLogCategory,
  DeviceLogSearchParams,
} from '../../../utils/deviceLogs';
import FormSelect from '../../form/FormSelect';
import TextField from '../../form/TextField';
import DeviceLogsPriorityField from './DeviceLogsLevelField';
import DeviceLogsTimeRangeField from './DeviceLogsTimeRangeField';
import StatusDisplay from '../../Status/StatusDisplay';

const getCategoryItems = (t: TFunction) => ({
  [DeviceLogCategory.AGENT]: t('Agent'),
  [DeviceLogCategory.SYSTEM]: t('System'),
  [DeviceLogCategory.FILE]: t('File path'),
});

export type DeviceLogsToolbarProps = {
  onLogTypeChange: VoidFunction;
  onCancelSearch: VoidFunction;
  isSubmitting: boolean;
};

const DeviceLogsToolbar = ({ onLogTypeChange, isSubmitting, onCancelSearch }: DeviceLogsToolbarProps) => {
  const { t } = useTranslation();
  const categoryItems = React.useMemo(() => getCategoryItems(t), [t]);

  const { submitForm, setValues, values, errors } = useFormikContext<DeviceLogSearchParams>();

  const onCategoryChange = React.useCallback(() => {
    void setValues(DEVICE_LOGS_FORM_INITIAL_VALUES);
    onLogTypeChange();
  }, [onLogTypeChange, setValues]);

  const validationError = React.useMemo(() => {
    const allErrors = Object.values(errors).filter(Boolean);
    return allErrors.join(', ');
  }, [errors]);

  const isSubmitDisabled = isSubmitting || Boolean(validationError);

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
                    <FormSelect name="category" items={categoryItems} onChange={onCategoryChange} />
                  </FlexItem>
                  {values.category === DeviceLogCategory.SYSTEM && (
                    <FlexItem style={{ minWidth: '12rem' }}>
                      <FormGroup id="form-control__systemdUnit" fieldId="systemdUnit">
                        <TextField
                          name="systemdUnit"
                          aria-label={t('Systemd unit')}
                          placeholder={t('Unit')}
                          showErrorMsg={false}
                        />
                      </FormGroup>
                    </FlexItem>
                  )}
                  {values.category !== DeviceLogCategory.FILE && (
                    <>
                      <FlexItem>
                        <DeviceLogsTimeRangeField />
                      </FlexItem>
                      <FlexItem>
                        <DeviceLogsPriorityField />
                      </FlexItem>
                    </>
                  )}
                  {values.category === DeviceLogCategory.FILE && (
                    <>
                      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                        <InputGroupText>{DEVICE_LOG_BASE_PATH}/</InputGroupText>
                      </FlexItem>
                      <FlexItem>
                        <FormGroup id="form-control__logFilePath" fieldId="textfield-logFilePath">
                          <TextField
                            name="logFilePath"
                            aria-label={t('Log file path')}
                            placeholder={t('Relative file path')}
                            showErrorMsg={false}
                          />
                        </FormGroup>
                      </FlexItem>
                    </>
                  )}
                </Flex>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup variant="action-group" align={{ default: 'alignEnd' }}>
              {isSubmitting && (
                <ToolbarItem>
                  <Button variant="link" onClick={onCancelSearch}>
                    {t('Cancel')}
                  </Button>
                </ToolbarItem>
              )}
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
      {validationError && (
        <StackItem>
          <StatusDisplay item={{ label: validationError, level: 'danger' }} />
        </StackItem>
      )}
    </Stack>
  );
};

export default DeviceLogsToolbar;
