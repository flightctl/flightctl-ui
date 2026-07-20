import * as React from 'react';
import { Alert, Bullseye, Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { useAppContext } from '../../../hooks/useAppContext';
import { useTranslation } from '../../../hooks/useTranslation';
import PageWithPermissions from '../../common/PageWithPermissions';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../types/rbac';
import { getConsoleAppStatuses } from '../../../utils/vmApplications';
import DeviceTerminal from '../../Terminal/DeviceTerminal';
import AppTerminal from '../../Terminal/AppTerminal';

const CONSOLE_QUERY_PARAM = 'console';
const DEVICE_CONSOLE = 'device';
const APPS_CONSOLE = 'apps';

const TERMINAL_PANEL_HEIGHT = 'calc(97vh - 300px)';

type TerminalTabProps = {
  device: Device;
};

const TerminalTab = ({ device }: TerminalTabProps) => {
  const { t } = useTranslation();
  const { checkPermissions } = usePermissionsContext();
  const [hasDeviceConsoleAccess, hasAppConsoleAccess] = checkPermissions([
    { kind: RESOURCE.DEVICE_CONSOLE, verb: VERB.GET },
    { kind: RESOURCE.DEVICE_APPLICATION_CONSOLE, verb: VERB.GET },
  ]);
  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const consoleAppStatuses = React.useMemo(
    () => getConsoleAppStatuses(device.status?.applications),
    [device.status?.applications],
  );

  // The AppTerminal is active based on presence of the query parameter "console".
  // Addiontally, if the user has access to the app console, but not the device console, the AppTerminal is also active.
  const hasAppNameQueryParam = searchParams.get(CONSOLE_QUERY_PARAM) !== null;
  const selectedAppName = hasAppNameQueryParam ? searchParams.get(CONSOLE_QUERY_PARAM) : undefined;
  const isAppModeActive = hasAppConsoleAccess && (hasAppNameQueryParam || !hasDeviceConsoleAccess);

  const handleTabSelect = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabKey: string | number) => {
    const mode = String(tabKey);
    if (mode === DEVICE_CONSOLE) {
      searchParams.delete(CONSOLE_QUERY_PARAM);
    } else {
      searchParams.set(CONSOLE_QUERY_PARAM, '');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleAppSelect = (name: string) => {
    searchParams.set(CONSOLE_QUERY_PARAM, name);
    setSearchParams(searchParams, { replace: true });
  };

  if (!hasDeviceConsoleAccess && !hasAppConsoleAccess) {
    return (
      <Bullseye>
        <Alert variant="warning" isInline title={t('You do not have permission to access the device terminal.')} />
      </Bullseye>
    );
  }

  return (
    <div
      data-testid="device-terminal-panel"
      style={{ height: TERMINAL_PANEL_HEIGHT, display: 'flex', flexDirection: 'column' }}
    >
      {hasAppConsoleAccess && hasDeviceConsoleAccess && (
        <Tabs
          activeKey={isAppModeActive ? APPS_CONSOLE : DEVICE_CONSOLE}
          onSelect={handleTabSelect}
          variant="secondary"
          aria-label={t('Console type')}
          usePageInsets
        >
          {hasDeviceConsoleAccess && (
            <Tab eventKey={DEVICE_CONSOLE} title={<TabTitleText>{t('Device terminal')}</TabTitleText>} />
          )}
          {hasAppConsoleAccess && (
            <Tab eventKey={APPS_CONSOLE} title={<TabTitleText>{t('VM console')}</TabTitleText>} />
          )}
        </Tabs>
      )}

      <div style={{ flex: 1, minHeight: 0, padding: 'var(--pf-t--global--spacer--md)' }}>
        {isAppModeActive ? (
          <AppTerminal
            device={device}
            consoleAppStatuses={consoleAppStatuses}
            appName={selectedAppName ?? undefined}
            onAppSelect={handleAppSelect}
          />
        ) : hasDeviceConsoleAccess ? (
          <div style={{ height: '100%' }}>
            <DeviceTerminal device={device} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const TerminalTabWithPermissions = (props: TerminalTabProps) => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [hasDeviceConsoleAccess, hasAppConsoleAccess] = checkPermissions([
    { kind: RESOURCE.DEVICE_CONSOLE, verb: VERB.GET },
    { kind: RESOURCE.DEVICE_APPLICATION_CONSOLE, verb: VERB.GET },
  ]);
  const allowed = hasDeviceConsoleAccess || hasAppConsoleAccess;
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <TerminalTab {...props} />
    </PageWithPermissions>
  );
};

export default TerminalTabWithPermissions;
