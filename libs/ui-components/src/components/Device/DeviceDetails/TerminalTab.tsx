import * as React from 'react';
import { Alert, AlertActionLink, Stack, StackItem } from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { useWebSocket } from '../../../hooks/useWebSocket';
import ErrorAlert from '../../ErrorAlert/ErrorAlert';
import { useTranslation } from '../../../hooks/useTranslation';
import Terminal, { ImperativeTerminalType } from '../../Terminal/Terminal';

const TerminalTab = ({ device }: { device: Device }) => {
  const { t } = useTranslation();
  const terminal = React.useRef<ImperativeTerminalType>(null);

  const onMsgReceived = React.useCallback((message: string) => {
    terminal.current?.onDataReceived(message);
  }, []);

  const { sendMessage, isClosed, error, reconnect } = useWebSocket(
    `/api/terminal/${device.metadata.name}`,
    onMsgReceived,
  );

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
      <StackItem>
        <Terminal onData={sendMessage} ref={terminal} />
      </StackItem>
    </Stack>
  );
};

export default TerminalTab;
