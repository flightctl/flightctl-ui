import * as React from 'react';
import { Button, CodeBlock, CodeBlockCode, Modal, Stack, StackItem } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons/dist/js/icons/copy-icon';
import { RedoIcon } from '@patternfly/react-icons/dist/js/icons/redo-icon';

import { DeviceStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';

import './DeviceStatusDebugModal.css';

const DeviceStatusDebugModal = ({ status, onClose }: { status: DeviceStatus; onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const [refreshVersion, setRefreshVersion] = React.useState<string>(status.lastSeen);

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
            isDisabled={status.lastSeen === refreshVersion}
            onClick={() => {
              setRefreshVersion(status.lastSeen);
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

export default DeviceStatusDebugModal;
