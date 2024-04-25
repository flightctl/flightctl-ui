import { useFetch } from '../../../../hooks/useFetch';
import { getErrorMessage } from '../../../../utils/error';
import {
  Alert,
  Button,
  Checkbox,
  Modal,
  Progress,
  ProgressMeasureLocation,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Repository, ResourceSyncList } from '@flightctl/types';
import * as React from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { isPromiseRejected } from '../../../../types/typeUtils';

type MassDeleteRepositoryModalProps = {
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
  repositories: Repository[];
};

const MassDeleteRepositoryModal: React.FC<MassDeleteRepositoryModalProps> = ({
  onClose,
  onDeleteSuccess,
  repositories,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>();
  const [deleteAll, setDeleteAll] = React.useState(true);
  const [selectedRepositoryIds, setSelectedRepositoryIds] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const { get, remove } = useFetch();

  const deleteRepositories = async () => {
    setIsDeleting(true);
    setProgress(0);
    const promises = repositories.map(async (r) => {
      const repositoryId = r.metadata.name || '';
      if (deleteAll || selectedRepositoryIds.includes(repositoryId)) {
        const resourceSyncs = await get<ResourceSyncList>(`resourcesyncs?labelSelector=repository=${repositoryId}`);
        const rsyncPromises = resourceSyncs.items.map((rsync) => remove(`resourcesyncs/${rsync.metadata.name}`));
        const rsyncResults = await Promise.allSettled(rsyncPromises);
        const rejectedResults = rsyncResults.filter(isPromiseRejected);
        if (rejectedResults.length) {
          throw new Error(`Failed to delete resource syncs: ${getErrorMessage(rejectedResults[0].reason)}`);
        }
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

  return (
    <Modal
      title={t('Delete repositories')}
      isOpen
      onClose={onClose}
      showClose={!isDeleting}
      variant="medium"
      actions={[
        <Button
          key="delete"
          variant="danger"
          onClick={deleteRepositories}
          isLoading={isDeleting}
          isDisabled={isDeleting}
        >
          {t('Delete')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>{t('Are you sure you want to delete the following repositories ?')}</StackItem>
        <StackItem>
          <Table>
            <Thead>
              <Tr>
                <Th>{t('Repository name')}</Th>
                <Th modifier="nowrap">
                  <Split hasGutter>
                    <SplitItem>
                      <Checkbox
                        isChecked={deleteAll}
                        onChange={(_, checked) => {
                          setDeleteAll(checked);
                          setSelectedRepositoryIds([]);
                        }}
                        id="select-all"
                        name={t('Delete Resource Syncs')}
                      />
                    </SplitItem>
                    <SplitItem>{t('Delete Resource Syncs')}</SplitItem>
                  </Split>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {repositories.map((repository, rowIndex) => {
                const repositoryId = repository.metadata.name || '';
                return (
                  <Tr key={repositoryId}>
                    <Td dataLabel={t('Repository name')}>{repositoryId}</Td>
                    <Td
                      select={{
                        rowIndex,
                        onSelect: (_, isSelected) => {
                          if (isSelected) {
                            setSelectedRepositoryIds([...selectedRepositoryIds, repositoryId]);
                          } else {
                            if (deleteAll) {
                              setSelectedRepositoryIds(
                                repositories.map((r) => r.metadata.name || '').filter((id) => id !== repositoryId),
                              );
                            } else {
                              setSelectedRepositoryIds(selectedRepositoryIds.filter((id) => id !== repositoryId));
                            }
                            setDeleteAll(false);
                          }
                        },
                        isSelected: deleteAll || selectedRepositoryIds.includes(repositoryId),
                      }}
                    />
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </StackItem>
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
    </Modal>
  );
};

export default MassDeleteRepositoryModal;
