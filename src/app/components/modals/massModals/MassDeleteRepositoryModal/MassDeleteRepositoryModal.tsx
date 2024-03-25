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
import { Repository } from '@types';
import * as React from 'react';

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
        const resourceSyncs = await get(`resourcesyncs?labelSelector=repository=${repositoryId}`);
        const rsyncPromises = resourceSyncs.map((rsync) => remove(`resourcesyncs/${getResourceId(rsync)}`));
        const rsyncResults = await Promise.allSettled(rsyncPromises);
        const rejectedResults = rsyncResults.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
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

    const rejectedResults = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

    if (rejectedResults.length) {
      setErrors(rejectedResults.map((r) => getErrorMessage(r.reason)));
    } else {
      onDeleteSuccess();
    }
  };

  return (
    <Modal
      title="Delete repositories"
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
          Delete
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          Cancel
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>Are you sure you want to delete the following repositories ?</StackItem>
        <StackItem>
          <Table>
            <Thead>
              <Tr>
                <Th>Repository name</Th>
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
                        name="Delete Resource Syncs"
                      />
                    </SplitItem>
                    <SplitItem>Delete Resource Syncs</SplitItem>
                  </Split>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {repositories.map((repository, rowIndex) => {
                const repositoryId = getResourceId(repository);
                return (
                  <Tr key={repository.metadata.name}>
                    <Td dataLabel="Repository name">{repositoryId}</Td>
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
              title="Deleting..."
              measureLocation={ProgressMeasureLocation.top}
              label={`${progress} of ${progressTotal}`}
              valueText={`${progress} of ${progressTotal}`}
            />
          </StackItem>
        )}
        {errors?.length && (
          <StackItem>
            <Alert isInline variant="danger" title="An error occured">
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
