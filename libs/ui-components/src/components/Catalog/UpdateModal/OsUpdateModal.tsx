import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItemVersion } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import UpdateGraph from './UpdateGraph';

type OsUpdateModalProps = {
  onClose: VoidFunction;
  currentVersion: CatalogItemVersion;
  updates: CatalogItemVersion[];
  onUpdate: (selectedEntry: string, channel: string) => Promise<void>;
  currentChannel: string;
};

const OsUpdateModal: React.FC<OsUpdateModalProps> = ({
  onClose,
  currentVersion,
  onUpdate,
  currentChannel,
  updates,
}) => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState(currentVersion.version);

  const handleSelectionChange = React.useCallback((_nodeId: string, version: string) => {
    setSelectedVersion(version);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(selectedVersion, currentChannel);
      onClose();
    } catch (e) {
    } finally {
      setIsUpdating(false);
    }
  };

  const isUpdateDisabled = isUpdating || selectedVersion === currentVersion.version;

  return (
    <Modal isOpen onClose={onClose} variant="large">
      <ModalHeader title={t('Update Operating system')} />
      <ModalBody>
        <div style={{ height: '400px' }}>
          <UpdateGraph
            selectedNodeId={selectedVersion}
            currentVersion={currentVersion}
            currentChannel={currentChannel}
            onSelectionChange={handleSelectionChange}
            updates={updates}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="primary"
          onClick={handleUpdate}
          isDisabled={isUpdateDisabled}
          isLoading={isUpdating}
        >
          {t('Update')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isUpdating}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default OsUpdateModal;
