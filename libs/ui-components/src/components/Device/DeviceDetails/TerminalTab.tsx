import * as React from 'react';
import { Alert, AlertActionLink, Bullseye, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { WsMetadata, useWebSocket } from '../../../hooks/useWebSocket';
import ErrorAlert from '../../ErrorAlert/ErrorAlert';
import { useTranslation } from '../../../hooks/useTranslation';
import Terminal, { ImperativeTerminalType } from '../../Terminal/Terminal';
import PageWithPermissions from '../../common/PageWithPermissions';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useOrganizationGuardContext } from '../../common/OrganizationGuard';

type TerminalTabProps = {
  device: Device;
};

const wsMeta: WsMetadata = {
  tty: true,
  term: 'xterm-256color',
};

const TerminalTab = ({ device }: TerminalTabProps) => {
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
    currentOrganization?.metadata?.name || undefined,
    onMsgReceived,
    wsMeta,
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

const TerminalTabWithPermissions = (props: TerminalTabProps) => {
  const [allowed, loading] = useAccessReview(RESOURCE.DEVICE_CONSOLE, VERB.GET);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <TerminalTab {...props} />
    </PageWithPermissions>
  );
};

export default TerminalTabWithPermissions;
