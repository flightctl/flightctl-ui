import * as React from 'react';
import { useEffect } from 'react';
import { Alert, Button, Icon, Modal, Spinner, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';

import { getErrorMessage } from '@app/utils/error';
import { useFetch } from '@app/hooks/useFetch';
import { ResourceSyncList } from '@types';

type DeleteRepositoryModalProps = {
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
  repositoryId: string;
};

const DeleteRepositoryModal = ({ repositoryId, onClose, onDeleteSuccess }: DeleteRepositoryModalProps) => {
  const { get, remove } = useFetch();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [rsError, setRsError] = React.useState<string>();
  const [message, setMessage] = React.useState<string>();
  const [resourceSyncIds, setResourceSyncIds] = React.useState<string[]>();
  const isLoadingRSs = resourceSyncIds === undefined;
  const hasResourceSyncs = !isLoadingRSs && resourceSyncIds.length > 0;

  const deleteRepositoryAndResourceSyncs = async () => {
    const toDeleteRSs = resourceSyncIds?.length || 0;
    let deletedCount = 0;
    if (toDeleteRSs > 0) {
      setMessage(`Deleting ${toDeleteRSs} resource syncs`);
      const promises = (resourceSyncIds || []).map((id) => remove('resourcesyncs', id));
      const results = await Promise.allSettled(promises);
      deletedCount = results.filter((result) => result.status === 'fulfilled').length;
    }

    const nonDeletedRSs = toDeleteRSs - deletedCount;
    if (nonDeletedRSs !== 0) {
      setError(`${nonDeletedRSs} resource syncs could not be deleted. Try deleting them manually.`);
      return false;
    }
    await remove('repositories', repositoryId);
    return true;
  };

  const loadRS = React.useCallback(async () => {
    try {
      const resourceSyncs = await get<ResourceSyncList>(`resourcesyncs?labelSelector=repository=${repositoryId}`);
      setResourceSyncIds(resourceSyncs.items.map((rs) => rs.metadata.name || ''));
      setRsError(undefined);
    } catch (e) {
      const error = `The repository cannot be safely deleted at this moment, as we couldn't determine if the repository contains resourcesyncs.`;
      setRsError(`${error}. Detail: ${getErrorMessage(e)}`);
      setResourceSyncIds([]);
    }
  }, [get, repositoryId]);

  useEffect(() => {
    void loadRS();
  }, [loadRS]);

  const deleteAction = async () => {
    setError(undefined);
    try {
      setIsDeleting(true);
      const success = await deleteRepositoryAndResourceSyncs();
      if (success) {
        onDeleteSuccess();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      title={`Delete repository ?`}
      isOpen
      onClose={onClose}
      variant={hasResourceSyncs ? 'medium' : 'small'}
      actions={[
        rsError ? (
          <Button variant="primary" onClick={loadRS}>
            Reload resource syncs
          </Button>
        ) : (
          <Button
            key="confirm"
            variant="danger"
            isDanger={hasResourceSyncs}
            isDisabled={isLoadingRSs || isDeleting}
            isLoading={isLoadingRSs || isDeleting}
            onClick={deleteAction}
          >
            {hasResourceSyncs ? 'Delete the repository and resource syncs' : 'Delete the repository'}
          </Button>
        ),
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          Cancel
        </Button>,
      ]}
    >
      <Stack hasGutter>
        {hasResourceSyncs && (
          <StackItem>
            <TextContent>
              <Text>
                <Icon status="warning" size="md">
                  <WarningTriangleIcon />
                </Icon>{' '}
                This repository defines resource syncs. By deleting the repository, its resource syncs will also be
                deleted.
              </Text>
              <Text>
                Any fleet that is being managed by this repository&apos;s resource syncs, will stop being managed by the
                service.
              </Text>
            </TextContent>
          </StackItem>
        )}
        {rsError ? (
          <Alert isInline variant="warning" title="Cannot delete repository">
            {rsError}
          </Alert>
        ) : (
          <StackItem>
            Are you sure you want to delete the repository <b>{repositoryId}</b>?
          </StackItem>
        )}
        {(isDeleting && message) ||
          (isLoadingRSs && (
            <StackItem>
              <Spinner size="sm" /> {isLoadingRSs ? 'Checking if the repository has resource syncs' : message}
            </StackItem>
          ))}
        {error && (
          <StackItem>
            <Alert isInline variant="danger" title="An error occured">
              {error}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default DeleteRepositoryModal;
