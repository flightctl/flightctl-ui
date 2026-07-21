import * as React from 'react';
import {
  Alert,
  AlertActionLink,
  Bullseye,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { ApplicationStatusType, Device, DeviceApplicationStatus } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { type AppConsoleConnectError, useAppConsoleWebSocket } from '../../hooks/useAppConsoleWebSocket';
import { useOrganizationGuardContext } from '../common/OrganizationGuard';
import TerminalConnectError from './TerminalConnectError';
import Terminal, { ImperativeTerminalType } from './Terminal';

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

  if (appStatus.status !== ApplicationStatusType.ApplicationStatusRunning) {
    return (
      <Bullseye>
        <Alert
          variant="info"
          isInline
          isPlain
          title={
            appStatus.status === ApplicationStatusType.ApplicationStatusStarting
              ? t('The virtual machine is starting. Console will be available once running.')
              : t('The virtual machine is not running. Start the VM to access the console.')
          }
        />
      </Bullseye>
    );
  }

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
          title={t('Connection was closed')}
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

  const selectedApp = appName ? consoleAppStatuses.find((app) => app.name === appName) : undefined;
  const activeAppName = selectedApp?.status === ApplicationStatusType.ApplicationStatusRunning ? selectedApp.name : '';

  const onMsgReceived = React.useCallback((data: string) => {
    terminal.current?.onDataReceived(data);
    return Promise.resolve();
  }, []);

  const { sendMessage, isClosed, error, reconnect, isConnecting, disconnect } = useAppConsoleWebSocket(
    device.metadata.name || '',
    activeAppName,
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
          selected={appName}
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
              const isAvailable = app.status === ApplicationStatusType.ApplicationStatusRunning;
              return (
                <SelectOption
                  key={app.name}
                  value={app.name}
                  isSelected={app.name === appName}
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
        {selectedApp ? (
          <AppTerminalContent
            appStatus={selectedApp}
            sendMessage={sendMessage}
            isConnecting={isConnecting}
            isClosed={isClosed}
            error={error}
            reconnect={reconnect}
            terminalRef={terminal}
          />
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
