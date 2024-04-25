import * as React from 'react';
import { useEffect } from 'react';
import { Alert, Button, Icon, Modal, Spinner, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';

import { getErrorMessage } from '../../../utils/error';
import { useFetch } from '../../../hooks/useFetch';
import { ResourceSyncList } from '@flightctl/types';
import { Trans } from 'react-i18next';
import { useTranslation } from '../../../hooks/useTranslation';

type DeleteRepositoryModalProps = {
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
  repositoryId: string;
};

const DeleteRepositoryModal = ({ repositoryId, onClose, onDeleteSuccess }: DeleteRepositoryModalProps) => {
  const { t } = useTranslation();
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
      setMessage(t('Deleting {{count}} resource sync', { count: toDeleteRSs }));
      const promises = (resourceSyncIds || []).map((id) => remove(`resourcesyncs/${id}`));
      const results = await Promise.allSettled(promises);
      deletedCount = results.filter((result) => result.status === 'fulfilled').length;
    }

    const nonDeletedRSs = toDeleteRSs - deletedCount;
    if (nonDeletedRSs !== 0) {
      setError(t('{{count}} resource sync could not be deleted. Try deleting it manually.', { count: nonDeletedRSs }));
      return false;
    }
    await remove(`repositories/${repositoryId}`);
    return true;
  };

  const loadRS = React.useCallback(async () => {
    try {
      const resourceSyncs = await get<ResourceSyncList>(`resourcesyncs?labelSelector=repository=${repositoryId}`);
      setResourceSyncIds(resourceSyncs.items.map((rs) => rs.metadata.name || ''));
      setRsError(undefined);
    } catch (e) {
      setRsError(
        t(
          `The repository cannot be safely deleted at this moment, as we couldn't determine if the repository contains resourcesyncs. Detail: {{detail}}`,
          { detail: getErrorMessage(e) },
        ),
      );
      setResourceSyncIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      title={t('Delete repository ?')}
      isOpen
      onClose={onClose}
      variant={hasResourceSyncs ? 'medium' : 'small'}
      actions={[
        rsError ? (
          <Button variant="primary" onClick={loadRS}>
            {t('Reload resource syncs')}
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
            {hasResourceSyncs ? t('Delete the repository and resource syncs') : t('Delete the repository')}
          </Button>
        ),
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
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
                {t(
                  'This repository defines resource syncs. By deleting the repository, its resource syncs will also be deleted.',
                )}
              </Text>
              <Text>
                {t(
                  `Any fleet that is being managed by this repository's resource syncs, will stop being managed by the service.`,
                )}
              </Text>
            </TextContent>
          </StackItem>
        )}
        {rsError ? (
          <Alert isInline variant="warning" title={t('Cannot delete repository')}>
            {rsError}
          </Alert>
        ) : (
          <StackItem>
            <Trans t={t}>
              Are you sure you want to delete the repository <b>{repositoryId}</b>?
            </Trans>
          </StackItem>
        )}
        {(isDeleting && message) ||
          (isLoadingRSs && (
            <StackItem>
              <Spinner size="sm" /> {isLoadingRSs ? t('Checking if the repository has resource syncs') : message}
            </StackItem>
          ))}
        {error && (
          <StackItem>
            <Alert isInline variant="danger" title={t('An error occurred')}>
              {error}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default DeleteRepositoryModal;
