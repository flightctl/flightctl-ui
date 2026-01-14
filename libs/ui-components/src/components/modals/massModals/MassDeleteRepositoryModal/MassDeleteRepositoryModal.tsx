import * as React from 'react';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Repository, ResourceSyncList } from '@flightctl/types';

import { useFetch } from '../../../../hooks/useFetch';
import { getErrorMessage } from '../../../../utils/error';
import { useTranslation } from '../../../../hooks/useTranslation';
import { isPromiseRejected } from '../../../../types/typeUtils';
import { getApiListCount } from '../../../../utils/api';
import { commonQueries } from '../../../../utils/query';

type MassDeleteRepositoryModalProps = {
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
  repositories: Repository[];
};

type ResourceSyncCountMap = Record<string, number>;

const MassDeleteRepositoryModal: React.FC<MassDeleteRepositoryModalProps> = ({
  onClose,
  onDeleteSuccess,
  repositories,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>();
  const [resourceSyncCount, setResourceSyncCount] = React.useState<ResourceSyncCountMap>({});
  const isFirstCountReq = Object.keys(resourceSyncCount).length === 0;
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const { get, remove } = useFetch();

  const fetchResourceSyncsCount = React.useCallback(async () => {
    setIsLoading(isFirstCountReq);

    const rsCount = {};
    const promises = repositories.map(async (r) => {
      const repositoryId = r.metadata.name || '';
      const resourceSyncs = await get<ResourceSyncList>(
        commonQueries.getResourceSyncsByRepo(repositoryId, { limit: 1 }),
      );
      rsCount[repositoryId] = getApiListCount(resourceSyncs);
    });
    await Promise.allSettled(promises);

    setResourceSyncCount(rsCount);
    setIsLoading(false);
  }, [get, repositories, isFirstCountReq]);

  const deleteRepositories = async () => {
    setIsDeleting(true);
    setProgress(0);
    const promises = repositories.map(async (r) => {
      const repositoryId = r.metadata.name || '';
      const resourceSyncs = await get<ResourceSyncList>(commonQueries.getResourceSyncsByRepo(repositoryId));
      const rsyncPromises = resourceSyncs.items.map((rsync) => remove(`resourcesyncs/${rsync.metadata.name}`));
      const rsyncResults = await Promise.allSettled(rsyncPromises);
      const rejectedResults = rsyncResults.filter(isPromiseRejected);
      if (rejectedResults.length) {
        throw new Error(
          t('Failed to delete resource syncs. {{errorDetails}}', {
            errorDetails: getErrorMessage(rejectedResults[0].reason),
          }),
        );
      }
      await remove(`repositories/${repositoryId}`);
      setProgress((p) => p + 1);
    });
    setProgressTotal(promises.length);
    const results = await Promise.allSettled(promises);
    setIsDeleting(false);

    const rejectedResults = results.filter(isPromiseRejected);

    if (rejectedResults.length) {
      setErrors(rejectedResults.map((r) => getErrorMessage(r.reason)));
    } else {
      onDeleteSuccess();
    }
  };

  React.useEffect(() => {
    void fetchResourceSyncsCount();
  }, [fetchResourceSyncsCount]);

  return (
    <Modal isOpen onClose={isDeleting ? undefined : onClose} variant="medium">
      <ModalHeader title={t('Delete repositories ?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          {isLoading && <>{t('Please wait while the repository details are loading')}</>}
          {!isLoading && (
            <>
              <StackItem>{t('Are you sure you want to delete the following repositories ?')}</StackItem>
              <StackItem>
                <Alert variant="warning" title={t('Resource syncs will also be deleted')} isInline>
                  {t(
                    'Note that all the resource syncs of the selected repositories will also be deleted. Any fleet that is being managed by those resource syncs will become unmanaged.',
                  )}
                </Alert>
              </StackItem>
              <StackItem>
                <Table>
                  <Thead>
                    <Tr>
                      <Th modifier="fitContent">{t('Repository name')}</Th>
                      <Th modifier="fitContent">{t('# Resource syncs')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {repositories.map((repository) => {
                      const repositoryId = repository.metadata.name || '';
                      return (
                        <Tr key={repositoryId}>
                          <Td dataLabel={t('Repository name')}>{repositoryId}</Td>
                          <Td dataLabel={t('# Resource syncs')}>{resourceSyncCount[repositoryId] || '0'}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </StackItem>
            </>
          )}
          {isDeleting && (
            <StackItem>
              <Progress
                value={progress}
                min={0}
                max={progressTotal}
                title={t('Deleting...')}
                measureLocation={ProgressMeasureLocation.top}
                label={t('{{progress}} of {{progressTotal}}', { progress, progressTotal })}
                valueText={t('{{progress}} of {{progressTotal}}', { progress, progressTotal })}
              />
            </StackItem>
          )}
          {errors?.length && (
            <StackItem>
              <Alert isInline variant="danger" title={t('An error occurred')}>
                <Stack hasGutter>
                  {errors.map((e, index) => (
                    <StackItem key={index}>{e}</StackItem>
                  ))}
                </Stack>
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={deleteRepositories}
          isLoading={isLoading || isDeleting}
          isDisabled={isLoading || isDeleting}
        >
          {t('Delete repositories')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MassDeleteRepositoryModal;
