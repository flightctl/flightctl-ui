import { useFetch } from '@app/hooks/useFetch';
import { getErrorMessage } from '@app/utils/error';
import { getResourceId } from '@app/utils/resource';
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
import { Repository, ResourceSyncList } from '@types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

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
  const [selectedRepositories, setSelectedRepositories] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const { get, remove } = useFetch();

  const deleteRepositories = async () => {
    setIsDeleting(true);
    setProgress(0);
    const promises = repositories.map(async (r) => {
      const repositoryId = getResourceId(r);
      if (deleteAll || selectedRepositories.includes(repositoryId)) {
        const resourceSyncs = await get<ResourceSyncList>(`resourcesyncs?labelSelector=repository=${r.metadata.name}`);
        const rsyncPromises = resourceSyncs.items.map((rsync) => remove('resourcesyncs', rsync.metadata.name || ''));
        const rsyncResults = await Promise.allSettled(rsyncPromises);
        const rejectedResults = rsyncResults.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
        if (rejectedResults.length) {
          throw new Error(`Failed to delete resource syncs: ${getErrorMessage(rejectedResults[0].reason)}`);
        }
      }
      await remove('repositories', repositoryId);
      setProgress((p) => p + 1);
    });
    setProgressTotal(promises.length);
    const results = await Promise.allSettled(promises);
    setIsDeleting(false);

    const rejectedResults = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

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
                          setSelectedRepositories([]);
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
                const repositoryId = getResourceId(repository);
                return (
                  <Tr key={repository.metadata.name}>
                    <Td dataLabel={t('Repository name')}>{repository.metadata.name}</Td>
                    <Td
                      select={{
                        rowIndex,
                        onSelect: (_, isSelected) => {
                          if (isSelected) {
                            setSelectedRepositories([...selectedRepositories, repositoryId]);
                          } else {
                            if (deleteAll) {
                              setSelectedRepositories(
                                repositories.map(getResourceId).filter((r) => r !== repositoryId),
                              );
                            } else {
                              setSelectedRepositories(selectedRepositories.filter((r) => r !== repositoryId));
                            }
                            setDeleteAll(false);
                          }
                        },
                        isSelected: deleteAll || !!selectedRepositories.includes(repositoryId),
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
            <Alert isInline variant="danger" title={t('An error occured')}>
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
