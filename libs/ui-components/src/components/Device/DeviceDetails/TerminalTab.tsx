import * as React from 'react';
import { Alert, AlertActionLink, Bullseye, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { WsMetadata, useWebSocket } from '../../../hooks/useWebSocket';
import ErrorAlert from '../../ErrorAlert/ErrorAlert';
import { useTranslation } from '../../../hooks/useTranslation';
import Terminal, { ImperativeTerminalType } from '../../Terminal/Terminal';
import PageWithPermissions from '../../common/PageWithPermissions';
import { usePermissionsContext } from '../../common/PermissionsContext';
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState<string>('calc(97vh - 300px)');

  React.useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const boundingRect = containerRef.current.getBoundingClientRect();
        if (boundingRect.top > 0) {
          setContainerHeight(`calc(97vh - ${Math.ceil(boundingRect.top)}px)`);
        }
      }
    };

    updateHeight();

    // Use ResizeObserver to detect when container position changes
    const resizeObserver = new ResizeObserver(updateHeight);

    // Also listen to window resize for viewport changes
    window.addEventListener('resize', updateHeight);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

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
    <div ref={containerRef} style={{ height: containerHeight, display: 'flex', flexDirection: 'column' }}>
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
    </div>
  );
};

const TerminalTabWithPermissions = (props: TerminalTabProps) => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.DEVICE_CONSOLE, verb: VERB.GET }]);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <TerminalTab {...props} />
    </PageWithPermissions>
  );
};

export default TerminalTabWithPermissions;
