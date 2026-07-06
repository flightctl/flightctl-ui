import * as React from 'react';
import { Alert, AlertActionLink, Bullseye, Spinner, Stack, StackItem } from '@patternfly/react-core';
import type { Device } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { useWebSocket, wsMeta } from '../../hooks/useWebSocket';
import { useOrganizationGuardContext } from '../common/OrganizationGuard';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import Terminal, { type ImperativeTerminalType } from './Terminal';

const DeviceTerminal = ({ device }: { device: Device }) => {
  const { t } = useTranslation();
  const terminal = React.useRef<ImperativeTerminalType>(null);
  const { currentOrganization } = useOrganizationGuardContext();

  const onMsgReceived = React.useCallback(async (message: Blob) => {
    try {
      const bytes = new Uint8Array(await message.arrayBuffer());
      const msgType = bytes[0];
      const decoder = new TextDecoder();
      let str = decoder.decode(bytes.slice(1));

      if (msgType === 3) {
        try {
          const err = JSON.parse(str) as { code: number; status: string };
          if (err.status === 'Failure') {
            str = `command terminated with non-zero exit code: exit status ${err.code}`;
          } else {
            return;
          }
        } catch {
          // Nothing to do
        }
      }
      terminal.current?.onDataReceived(str);
    } catch (err) {
      // eslint-disable-next-line
      console.error(err);
    }
  }, []);

  const { sendMessage, isClosed, error, reconnect, isConnecting } = useWebSocket(
    device.metadata.name || '',
    currentOrganization?.id || undefined,
    onMsgReceived,
    wsMeta,
  );

  if (isConnecting) {
    return (
      <Bullseye data-testid="device-terminal-loading">
        <Spinner />
      </Bullseye>
    );
  }

  if (error) {
    return (
      <ErrorAlert
        error={error}
        onRetry={() => {
          terminal.current?.reset();
          reconnect();
        }}
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
          actionLinks={
            <AlertActionLink
              onClick={() => {
                terminal.current?.reset();
                reconnect();
              }}
            >
              {t('Reconnect')}
            </AlertActionLink>
          }
        />
      )}
      <StackItem isFilled>
        <Terminal onData={sendMessage} ref={terminal} />
      </StackItem>
    </Stack>
  );
};

export default DeviceTerminal;
