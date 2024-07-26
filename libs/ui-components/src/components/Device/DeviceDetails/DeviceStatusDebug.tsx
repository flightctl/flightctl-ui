import * as React from 'react';
import { Button, CodeBlock, CodeBlockCode, Modal, Stack, StackItem } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons/dist/js/icons/copy-icon';

import { DeviceStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';

import './DeviceStatusDebug.css';
import { RedoIcon } from '@patternfly/react-icons/dist/js/icons';

const DeviceStatusDebugInfo = ({ status, onClose }: { status: DeviceStatus; onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const [refreshVersion, setRefreshVersion] = React.useState<string>(status.updatedAt);

  const statusJson = React.useMemo(() => {
    return JSON.stringify({ deviceStatus: status }, null, 3);
    // We only update the JSON when the "Refresh status" button is clicked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshVersion]);

  const onCopy = () => {
    void navigator.clipboard.writeText(statusJson);
  };

  return (
    <Modal
      variant="medium"
      isOpen
      title={t('Device status debug information')}
      showClose
      disableFocusTrap
      onClose={onClose}
    >
      <Stack hasGutter>
        <StackItem className="fctl-device-status-debug__actions">
          <Button variant="primary" icon={<CopyIcon />} onClick={onCopy}>
            {t('Copy debug info')}
          </Button>{' '}
          <Button
            variant="link"
            icon={<RedoIcon />}
            isDisabled={status.updatedAt === refreshVersion}
            onClick={() => {
              setRefreshVersion(status.updatedAt);
            }}
          >
            {t('Load updated status')}
          </Button>
        </StackItem>
        <StackItem>
          <CodeBlock>
            <CodeBlockCode>{statusJson}</CodeBlockCode>
          </CodeBlock>
        </StackItem>
      </Stack>
    </Modal>
  );
};

const DeviceStatusDebug = ({ status }: { status: DeviceStatus }) => {
  const { t } = useTranslation();
  const [showDebugInfo, setShowDebugInfo] = React.useState<boolean>();

  const toggleShow = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  return (
    <div className="container">
      <Button variant="link" onClick={toggleShow}>
        {t('View')}
      </Button>

      {showDebugInfo && <DeviceStatusDebugInfo status={status} onClose={toggleShow} />}
    </div>
  );
};

export default DeviceStatusDebug;
