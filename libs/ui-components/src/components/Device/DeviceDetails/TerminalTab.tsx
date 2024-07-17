import * as React from 'react';
import { Alert, AlertActionLink, Bullseye, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { useWebSocket } from '../../../hooks/use-ws';
import ErrorAlert from '../../ErrorAlert/ErrorAlert';
import { useTranslation } from '../../../hooks/useTranslation';
import Terminal, { ImperativeTerminalType } from '../../Terminal/Terminal';

const TerminalTab = ({ device }: { device: Device }) => {
  const { t } = useTranslation();
  const terminal = React.useRef<ImperativeTerminalType>(null);

  const onMsgReceived = React.useCallback((message: string) => {
    terminal.current?.onDataReceived(message);
  }, []);

  const { sendMessage, isConnecting, isClosed, error, reconnect } = useWebSocket(
    `/api/terminal/${device.metadata.name}`,
    onMsgReceived,
  );

  if (isConnecting) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <Stack hasGutter>
      {isClosed && (
        <Alert
          isInline
          variant="info"
          title={t('Connection was closed')}
          actionLinks={<AlertActionLink onClick={reconnect}>{t('Reconnect')}</AlertActionLink>}
        />
      )}
      <StackItem>
        <Terminal onData={sendMessage} ref={terminal} />
      </StackItem>
    </Stack>
  );
};

export default TerminalTab;
