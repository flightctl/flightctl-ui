import * as React from 'react';
import {
  Button,
  Label,
  LabelGroup,
  Stack,
  StackItem,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { LogViewerSearch } from '@patternfly/react-log-viewer';
import { DownloadIcon } from '@patternfly/react-icons/dist/js/icons/download-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import {
  DeviceLogCategory,
  DeviceLogSearchParams,
  getActiveTimeFilterLabel,
  getDeviceLogLevelLabel,
} from '../../../utils/deviceLogs';

import './DeviceLogsInnerToolbar.css';

export type DeviceLogsInnerToolbarProps = {
  lastSearchParams: DeviceLogSearchParams;
  onSearchUpdate: (params: DeviceLogSearchParams) => Promise<boolean>;
  onResetForm: VoidFunction;
  onDownload: VoidFunction;
  onOpenRaw: VoidFunction;
};

const DeviceLogsInnerToolbar = ({
  lastSearchParams,
  onSearchUpdate,
  onResetForm,
  onDownload,
  onOpenRaw,
  children,
}: React.PropsWithChildren<DeviceLogsInnerToolbarProps>) => {
  const { t } = useTranslation();
  const { setValues, values } = useFormikContext<DeviceLogSearchParams>();
  const hasChildren = Boolean(children);

  const updateLiveLogs = React.useCallback(
    (checked: boolean) => {
      const newParams = { ...lastSearchParams, showLiveLogs: checked };
      void setValues(newParams);
      return newParams;
    },
    [lastSearchParams, setValues],
  );

  // The "show live logs" switch can only be applied after the logs have been retrieved and it triggers a new search.
  const onShowLiveLogsChange = React.useCallback(
    (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
      const newParams = updateLiveLogs(checked);
      void onSearchUpdate(newParams);
    },
    [updateLiveLogs, onSearchUpdate],
  );

  const doResetForm = React.useCallback(() => {
    updateLiveLogs(false);
    onResetForm();
  }, [onResetForm, updateLiveLogs]);

  const onRemoveFilter = React.useCallback(
    (filterKey: keyof DeviceLogSearchParams, defaultValue: string | undefined) => () => {
      // We sync the form values with the search params with the current filter removed.
      // That syncs the form controls to the updated search (including reverting non-persisted form changes)
      const newParams = { ...lastSearchParams, [filterKey]: defaultValue };
      void setValues(newParams);
      void onSearchUpdate(newParams);
    },
    [onSearchUpdate, lastSearchParams, setValues],
  );

  const activeFilters = React.useMemo(() => {
    const { category, level, systemdUnit, logFilePath } = lastSearchParams;

    const filters: { key: string; label: string; onRemove?: VoidFunction }[] = [];
    if (category === DeviceLogCategory.SYSTEM && systemdUnit) {
      filters.push({
        key: 'unit',
        label: t('Unit: {{unit}}', { unit: systemdUnit }),
        onRemove: onRemoveFilter('systemdUnit', ''),
      });
    }

    const activeTimeFilter = getActiveTimeFilterLabel(t, lastSearchParams);
    if (activeTimeFilter) {
      filters.push({
        key: 'time',
        label: t('Time: {{timeText}}', { timeText: activeTimeFilter }),
        onRemove: onRemoveFilter('timeRange', 'all'),
      });
    }

    if (category !== DeviceLogCategory.FILE && level !== 'all') {
      filters.push({
        key: 'level',
        label: t('Level: {{level}}', { level: getDeviceLogLevelLabel(t, level) }),
        onRemove: onRemoveFilter('level', 'all'),
      });
    }

    if (category === DeviceLogCategory.FILE && logFilePath) {
      // File path filter is not removable, as the search would become invalid
      filters.push({
        key: 'file-path',
        label: t('File path: {{logFilePath}}', { logFilePath }),
      });
    }

    return filters;
  }, [onRemoveFilter, lastSearchParams, t]);

  return (
    <Stack hasGutter={hasChildren}>
      <StackItem>
        <Toolbar id="device-logs-log-viewer-toolbar" inset={{ default: 'insetNone' }} isStatic>
          <ToolbarContent alignItems="start" rowWrap={{ default: 'wrap', ['2xl']: 'nowrap' }}>
            <ToolbarGroup rowWrap={{ default: 'nowrap' }}>
              <ToolbarItem>
                <LabelGroup categoryName={t('Active filters')}>
                  {activeFilters.map((filter) => (
                    <Label
                      key={filter.key}
                      variant="outline"
                      onClose={
                        filter.onRemove
                          ? (e) => {
                              e.preventDefault();
                              filter.onRemove?.();
                            }
                          : undefined
                      }
                    >
                      {filter.label}
                    </Label>
                  ))}
                </LabelGroup>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant="link" isInline onClick={doResetForm}>
                  {t('Clear search')}
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup variant="action-group" align={{ default: 'alignStart', ['2xl']: 'alignEnd' }}>
              <ToolbarItem alignSelf="center">
                <Switch
                  id="device-logs-show-live-logs"
                  label={t('Show live logs')}
                  isChecked={values.showLiveLogs}
                  onChange={onShowLiveLogsChange}
                />
              </ToolbarItem>
              <ToolbarItem>
                <LogViewerSearch placeholder={t('Search logs')} minSearchChars={2} aria-label={t('Search logs')} />
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="plain"
                  type="button"
                  icon={<ExternalLinkAltIcon />}
                  aria-label={t('View raw logs')}
                  onClick={onOpenRaw}
                />
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="plain"
                  type="button"
                  icon={<DownloadIcon />}
                  aria-label={t('Download logs')}
                  onClick={onDownload}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </StackItem>

      {hasChildren && <StackItem>{children}</StackItem>}
    </Stack>
  );
};

export default DeviceLogsInnerToolbar;
