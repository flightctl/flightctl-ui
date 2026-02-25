import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { getErrorMessage } from '../../../utils/error';
import UpdateGraph from './UpdateGraph';

type OsUpdateModalProps = {
  catalogItem: CatalogItem;
  onClose: VoidFunction;
  currentVersion: CatalogItemVersion;
  updates: CatalogItemVersion[];
  onUpdate: (catalogItemVersion: CatalogItemVersion, channel: string) => Promise<void>;
  currentChannel: string;
};

const OsUpdateModal: React.FC<OsUpdateModalProps> = ({
  onClose,
  currentVersion,
  onUpdate,
  currentChannel,
  updates,
  catalogItem,
}) => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState(currentVersion.version);
  const [error, setError] = React.useState<string>();

  const handleSelectionChange = React.useCallback((_nodeId: string, version: string) => {
    setSelectedVersion(version);
  }, []);

  const handleUpdate = async () => {
    setError(undefined);
    setIsUpdating(true);
    const catalogItemVersion = catalogItem.spec.versions.find((v) => v.version === selectedVersion);
    if (!catalogItemVersion) {
      setError(t('Version {{version}} not found', { version: selectedVersion }));
      setIsUpdating(false);
      return;
    }
    try {
      await onUpdate(catalogItemVersion, currentChannel);
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsUpdating(false);
    }
  };

  const isUpdateDisabled = isUpdating || selectedVersion === currentVersion.version;

  return (
    <Modal isOpen onClose={isUpdating ? undefined : onClose} variant="large">
      <ModalHeader title={t('Update Operating system')} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <UpdateGraph
              selectedVersion={selectedVersion}
              currentVersion={currentVersion}
              currentChannel={currentChannel}
              onSelectionChange={handleSelectionChange}
              updates={updates}
            />
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('Failed to update OS')}>
                {error}
              </Alert>
            </StackItem>
          )}
        </Stack>
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
