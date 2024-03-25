import { getResourceId } from '@app/utils/resource';
import { Alert, Button, Modal, Progress, ProgressMeasureLocation, Stack, StackItem } from '@patternfly/react-core';
import { Fleet } from '@types';
import * as React from 'react';
import { getErrorMessage } from '@app/utils/error';
import { useFetch } from '@app/hooks/useFetch';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import FleetOwnerLink from '@app/components/Fleet/FleetDetails/FleetOwnerLink';

type MassDeleteFleetModalProps = {
  onClose: VoidFunction;
  resources: Fleet[];
  onDeleteSuccess: VoidFunction;
};

const MassDeleteFleetModal: React.FC<MassDeleteFleetModalProps> = ({ onClose, resources, onDeleteSuccess }) => {
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>();
  const { remove } = useFetch();

  const resourcesToDelete = resources.filter((r) => !r.metadata.owner);

  const deleteResources = async () => {
    setProgress(0);
    setIsDeleting(true);
    const promises = resourcesToDelete.map(async (r) => {
      await remove(`fleets/${getResourceId(r)}`);
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
      title="Delete fleets"
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
        <StackItem>
          The following fleets will be deleted and as a result, the devices managed by them will be left unmanaged. Are
          you sure you want to delete the listed fleets?
        </StackItem>
        {resourcesToDelete.length !== resources.length && (
          <StackItem>
            <Alert
              variant="info"
              isInline
              title={`Resource syncs manage some of the selected fleets and they cannot be deleted. To remove those fleets, delete the resource syncs from the related repositories inside the "Repositories" tab.`}
            />
          </StackItem>
        )}
        <StackItem>
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Managed by</Th>
              </Tr>
            </Thead>
            <Tbody>
              {resources.map((resource) => {
                return (
                  <Tr key={resource.metadata.name}>
                    <Td dataLabel="Name">{resource.metadata.name || '-'}</Td>
                    <Td dataLabel="Managed by">
                      <FleetOwnerLink owner={resource.metadata.owner} />
                    </Td>
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

export default MassDeleteFleetModal;
