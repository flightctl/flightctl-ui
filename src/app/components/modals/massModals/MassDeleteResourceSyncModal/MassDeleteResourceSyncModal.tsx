import { getResourceId } from '@app/utils/resource';
import { Alert, Button, Modal, Progress, ProgressMeasureLocation, Stack, StackItem } from '@patternfly/react-core';
import { ResourceSync } from '@types';
import * as React from 'react';
import { getErrorMessage } from '@app/utils/error';
import { useFetch } from '@app/hooks/useFetch';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

type MassDeleteResourceSyncModalProps = {
  onClose: VoidFunction;
  resources: ResourceSync[];
  onDeleteSuccess: VoidFunction;
};

const MassDeleteResourceSyncModal: React.FC<MassDeleteResourceSyncModalProps> = ({
  onClose,
  resources,
  onDeleteSuccess,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>();
  const { remove } = useFetch();

  const deleteResources = async () => {
    setIsDeleting(true);
    setProgress(0);
    const promises = resources.map(async (r) => {
      await remove(`resourcesyncs/${getResourceId(r)}`);
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
      title="Delete resource syncs"
      isOpen
      onClose={onClose}
      showClose={!isDeleting}
      variant="medium"
      actions={[
        <Button key="delete" variant="danger" onClick={deleteResources} isLoading={isDeleting} isDisabled={isDeleting}>
          Delete
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          Cancel
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>Are you sure you want to delete the following resource syncs ?</StackItem>
        <StackItem>
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Path</Th>
              </Tr>
            </Thead>
            <Tbody>
              {resources.map((resource) => {
                return (
                  <Tr key={resource.metadata.name}>
                    <Td dataLabel="Name">{resource.metadata.name || '-'}</Td>
                    <Td dataLabel="Path">{resource.spec.path || '-'}</Td>
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

export default MassDeleteResourceSyncModal;
