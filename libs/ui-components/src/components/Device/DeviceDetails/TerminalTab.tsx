import * as React from 'react';
import { Alert, AlertActionLink, Stack, StackItem } from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { useWebSocket } from '../../../hooks/useWebSocket';
import ErrorAlert from '../../ErrorAlert/ErrorAlert';
import { useTranslation } from '../../../hooks/useTranslation';
import Terminal, { ImperativeTerminalType } from '../../Terminal/Terminal';
import PageWithPermissions from '../../common/PageWithPermissions';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../types/rbac';

type TerminalTabProps = {
  device: Device;
};

const TerminalTab = ({ device }: TerminalTabProps) => {
  const { t } = useTranslation();
  const terminal = React.useRef<ImperativeTerminalType>(null);

  const onMsgReceived = React.useCallback(async (message: Blob) => {
    const msg = await message.text();
    terminal.current?.onDataReceived(msg);
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

const TerminalTabWithPermissions = (props: TerminalTabProps) => {
  const [allowed, loading] = useAccessReview(RESOURCE.DEVICE_CONSOLE, VERB.GET);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <TerminalTab {...props} />
    </PageWithPermissions>
  );
};

export default TerminalTabWithPermissions;
