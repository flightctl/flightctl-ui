import * as React from 'react';
import type { TFunction } from 'react-i18next';
import {
  Alert,
  AlertActionLink,
  Bullseye,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import {
  ApplicationDesiredState,
  ApplicationStatusType,
  type Device,
  type DeviceApplicationStatus,
} from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { type AppConsoleConnectError, useAppConsoleWebSocket } from '../../hooks/useAppConsoleWebSocket';
import { getDeviceAppLifecycleOverrides, isAppConsoleAvailable } from '../../utils/applicationLifecycle';
import { useOrganizationGuardContext } from '../common/OrganizationGuard';
import TerminalConnectError from './TerminalConnectError';
import Terminal, { type ImperativeTerminalType } from './Terminal';

const getAppTerminalUnavailableTitle = (
  t: TFunction,
  status: ApplicationStatusType,
  desiredState: ApplicationDesiredState | undefined,
) => {
  switch (status) {
    case ApplicationStatusType.ApplicationStatusStarting:
    case ApplicationStatusType.ApplicationStatusPreparing:
      return t('The virtual machine is starting. Console will be available once running.');
    case ApplicationStatusType.ApplicationStatusStopped:
    case ApplicationStatusType.ApplicationStatusCompleted:
      return t('The virtual machine is stopped. Start the VM to access the console.');
    case ApplicationStatusType.ApplicationStatusStopping:
      return t('The virtual machine is stopping. Start the VM to access the console.');
    default:
      if (desiredState === ApplicationDesiredState.ApplicationDesiredStateStopped) {
        // App is currently running, but it has been signaled to stop.
        return t('The virtual machine is stopping. Start the VM to access the console.');
      }
      return t('The virtual machine is not running. Start the VM to access the console.');
  }
};

const AppTerminalContent = ({
  appStatus,
  sendMessage,
  isConnecting,
  isClosed,
  error,
  reconnect,
  terminalRef,
}: {
  appStatus: DeviceApplicationStatus;
  sendMessage: (msg: string, resize?: boolean) => void;
  isConnecting: boolean;
  isClosed: boolean;
  error: AppConsoleConnectError | undefined;
  reconnect: (options?: { force?: boolean }) => void;
  terminalRef: React.RefObject<ImperativeTerminalType>;
}) => {
  const { t } = useTranslation();

  const handleReconnect = React.useCallback(
    (options?: { force?: boolean }) => {
      terminalRef.current?.reset();
      reconnect(options);
    },
    [terminalRef, reconnect],
  );

  if (isConnecting) {
    return (
      <Bullseye data-testid="app-console-loading">
        <Spinner />
      </Bullseye>
    );
  }

  if (error) {
    return (
      <TerminalConnectError
        error={error}
        onRetry={handleReconnect}
        onTakeoverSession={() => handleReconnect({ force: true })}
        appName={appStatus.name}
      />
    );
  }

  return (
    <Stack hasGutter style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isClosed && (
        <Alert
          isInline
          variant="info"
          title={t('Connection was closed. The VM may be starting, stopping, or stopped.')}
          actionLinks={<AlertActionLink onClick={() => handleReconnect()}>{t('Reconnect')}</AlertActionLink>}
        />
      )}
      <StackItem isFilled>
        <div data-testid="app-console-terminal" style={{ height: '100%' }}>
          <Terminal
            onData={sendMessage}
            ref={terminalRef}
            connectedMessage={t('Connected to serial console: {{ appName }}', { appName: appStatus.name })}
          />
        </div>
      </StackItem>
    </Stack>
  );
};

const AppTerminal = ({
  device,
  consoleAppStatuses,
  appName,
  onAppSelect,
}: {
  device: Device;
  consoleAppStatuses: DeviceApplicationStatus[];
  appName: string | undefined;
  onAppSelect: (name: string) => void;
}) => {
  const { t } = useTranslation();
  const { currentOrganization } = useOrganizationGuardContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const terminal = React.useRef<ImperativeTerminalType>(null);

  const lifecycleOverrides = React.useMemo(
    () => getDeviceAppLifecycleOverrides(device.metadata.annotations ?? {}),
    [device.metadata.annotations],
  );

  const availableApps = consoleAppStatuses.filter((app) =>
    isAppConsoleAvailable(app.status, lifecycleOverrides[app.name]),
  );

  // The app that is currently connected to the terminal.
  let connectedApp: DeviceApplicationStatus | undefined = undefined;
  if (appName) {
    connectedApp = availableApps.find((app) => app.name === appName);
  }
  // Only select an app by default if it's the only VM app in the device, and it's available.
  if (!connectedApp && consoleAppStatuses.length === 1 && availableApps.length === 1) {
    connectedApp = availableApps[0];
  }

  // The app that is selected in the dropdown. It will remain selected even if the VM becomes unavailable (it's stopped, etc).
  let selectedApp: DeviceApplicationStatus | undefined = undefined;
  if (connectedApp) {
    selectedApp = connectedApp;
  } else if (appName) {
    selectedApp = consoleAppStatuses.find((app) => app.name === appName);
  } else if (consoleAppStatuses.length === 1) {
    selectedApp = consoleAppStatuses[0];
  }

  const onMsgReceived = React.useCallback((data: string) => {
    terminal.current?.onDataReceived(data);
    return Promise.resolve();
  }, []);

  const { sendMessage, isClosed, error, reconnect, isConnecting, disconnect } = useAppConsoleWebSocket(
    device.metadata.name || '',
    connectedApp?.name || '',
    currentOrganization?.id || undefined,
    onMsgReceived,
  );

  const handleAppSelect = (name: string) => {
    if (name !== appName) {
      disconnect();
    }
    onAppSelect(name);
  };

  if (consoleAppStatuses.length === 0) {
    return (
      <Bullseye>
        <Alert
          variant="info"
          isInline
          isPlain
          title={t('No virtual machines found. Create a virtual machine to access its serial console.')}
        />
      </Bullseye>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Select
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={(_event, value) => {
            setIsOpen(false);
            handleAppSelect(String(value));
          }}
          selected={selectedApp?.name}
          shouldFocusToggleOnSelect
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
              style={{ minWidth: '260px' }}
            >
              {selectedApp?.name || t('Select a virtual machine')}
            </MenuToggle>
          )}
        >
          <SelectList>
            {consoleAppStatuses.map((app) => {
              const desiredState = lifecycleOverrides[app.name];
              const isAvailable = isAppConsoleAvailable(app.status, desiredState);
              return (
                <SelectOption
                  key={app.name}
                  value={app.name}
                  isSelected={app.name === (appName || connectedApp?.name)}
                  description={
                    isAvailable
                      ? t('Serial console · {{status}}', { status: app.status })
                      : t('The application must be running to access the console.')
                  }
                  isDisabled={!isAvailable}
                >
                  {app.name}
                </SelectOption>
              );
            })}
          </SelectList>
        </Select>
      </StackItem>
      <StackItem isFilled style={{ minHeight: 0 }}>
        {connectedApp ? (
          <AppTerminalContent
            appStatus={connectedApp}
            sendMessage={sendMessage}
            isConnecting={isConnecting}
            isClosed={isClosed}
            error={error}
            reconnect={reconnect}
            terminalRef={terminal}
          />
        ) : selectedApp ? (
          <Bullseye>
            <Alert
              variant="info"
              isInline
              isPlain
              title={getAppTerminalUnavailableTitle(t, selectedApp.status, lifecycleOverrides[selectedApp.name])}
            />
          </Bullseye>
        ) : (
          <Bullseye>
            <Alert
              variant="info"
              isInline
              isPlain
              title={t('Select a virtual machine to connect to its serial console.')}
            />
          </Bullseye>
        )}
      </StackItem>
    </Stack>
  );
};

export default AppTerminal;
