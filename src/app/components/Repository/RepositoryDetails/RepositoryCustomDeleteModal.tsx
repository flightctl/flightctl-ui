import * as React from 'react';
import { useEffect } from 'react';
import {
  Alert,
  Button,
  Icon,
  List,
  ListComponent,
  ListItem,
  Modal,
  OrderType,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';

import { getErrorMessage } from '@app/utils/error';
import { useFetch } from '@app/hooks/useFetch';

type RepositoryCustomDeleteModalProps = {
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
  repositoryId: string;
};

const RepositoryCustomDeleteModal = ({ repositoryId, onClose, onDeleteSuccess }: RepositoryCustomDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [message, setMessage] = React.useState<string>();
  const { get, remove } = useFetch();
  const [resourceSyncIds, setResourceSyncIds] = React.useState<string[]>();
  const hasResourceSyncs = !!resourceSyncIds?.length;

  const deleteRepositoryOnly = async () => {
    await remove(`repositories/${repositoryId}`);
  };

  const deleteRepositoryAndResourceSyncs = async () => {
    const toDeleteCount = resourceSyncIds?.length || 0;
    setMessage(`Deleting ${toDeleteCount} resourcesyncs`);

    const promises = (resourceSyncIds || []).map((id) => remove(`resourcesyncs/${id}`));
    const results = await Promise.allSettled(promises);
    const deletedCount = results.filter((result) => result.status === 'fulfilled').length;

    const allDeleted = deletedCount === toDeleteCount;
    if (allDeleted) {
      await deleteRepositoryOnly();
    } else {
      setError(`${toDeleteCount - deletedCount} resourcesyncs could not be deleted, try deleting them manually`);
    }
    return allDeleted;
  };

  useEffect(() => {
    const loadRS = async () => {
      try {
        const resourceSyncs = await get(`resourcesyncs?labelSelector=repository=${repositoryId}`);
        setResourceSyncIds(resourceSyncs?.items?.map((rs) => rs.metadata.name));
      } catch (e) {
        const error = `We couldn't fetch the repository resourcesyncs. If the repository contains resourcesyncs, they won't be deleted`;
        setError(`${error}. Detail: ${getErrorMessage(e)}`);
        setResourceSyncIds([]);
      }
    };
    void loadRS();
  }, [get, repositoryId]);

  if (resourceSyncIds === undefined) {
    return <Spinner />;
  }

  const deleteAction = async (actionName: 'repoAndRSs' | 'repoOnly') => {
    setError(undefined);
    try {
      setIsDeleting(true);
      if (actionName === 'repoAndRSs') {
        const success = await deleteRepositoryAndResourceSyncs();
        if (success) {
          onDeleteSuccess();
        }
      } else {
        await deleteRepositoryOnly();
        onDeleteSuccess();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteActions = [
    <Button
      key="repoOnly"
      variant="danger"
      isDisabled={isDeleting}
      isLoading={isDeleting}
      onClick={() => deleteAction('repoOnly')}
    >
      {hasResourceSyncs ? '1. Delete the repository only' : 'Delete the repository'}
    </Button>,
  ];
  if (hasResourceSyncs) {
    deleteActions.push(
      <Button
        key="repoAndRSs"
        isLoading={isDeleting}
        variant="link"
        isDanger
        isDisabled={isDeleting}
        onClick={() => deleteAction('repoAndRSs')}
      >
        2. Delete the resourcesyncs as well
      </Button>,
    );
  }

  return (
    <Modal
      title={`Delete repository ?`}
      isOpen
      onClose={onClose}
      variant={hasResourceSyncs ? 'medium' : 'small'}
      actions={[
        ...deleteActions,
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
                This repository has resourcesyncs. Choose one of the following options:
              </Text>
            </TextContent>
            <List component={ListComponent.ol} type={OrderType.number}>
              <ListItem>
                Delete the repository only, and keep the resourcesyncs. The fleet(s) linked to the resourcesyncs will
                continue to be managed by FlightCtl.
              </ListItem>
              <ListItem>
                Delete both the repository and its resourcesyncs (RSs).{' '}
                <strong>The fleet(s) linked to the resourcesyncs will become unmanaged.</strong>
              </ListItem>
            </List>
          </StackItem>
        )}
        <StackItem>
          Are you sure you want to delete the repository <b>{repositoryId}</b>?
        </StackItem>
        {isDeleting && message && (
          <StackItem>
            <Spinner size="sm" /> {message}
          </StackItem>
        )}
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

export default RepositoryCustomDeleteModal;
