import { Alert, Button, Modal, Progress, ProgressMeasureLocation, Stack, StackItem } from '@patternfly/react-core';
import { Fleet, ResourceSync } from '@types';
import * as React from 'react';
import { getErrorMessage } from '@app/utils/error';
import { useFetch } from '@app/hooks/useFetch';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import FleetOwnerLink, { RSLink } from '@app/components/Fleet/FleetDetails/FleetOwnerLink';
import { isFleet } from '@app/types/extraTypes';
import { useTranslation } from 'react-i18next';

type MassDeleteFleetModalProps = {
  onClose: VoidFunction;
  resources: Array<Fleet | ResourceSync>;
  onDeleteSuccess: VoidFunction;
};

const MassDeleteFleetModal: React.FC<MassDeleteFleetModalProps> = ({ onClose, resources, onDeleteSuccess }) => {
  const { t } = useTranslation();
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
      await remove(isFleet(r) ? 'fleets' : 'resourcesyncs', r.metadata.name || '');
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
      title={t('Delete fleets')}
      isOpen
      onClose={onClose}
      showClose={!isDeleting}
      variant="medium"
      actions={[
        <Button key="delete" variant="danger" onClick={deleteResources} isLoading={isDeleting} isDisabled={isDeleting}>
          {t('Delete')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          {t(
            'The following fleets will be deleted and as a result, the devices managed by them will be left unmanaged. Are you sure you want to delete the listed fleets?',
          )}
        </StackItem>
        {resourcesToDelete.length !== resources.length && (
          <StackItem>
            <Alert
              variant="info"
              isInline
              title={t(
                `Resource syncs manage some of the selected fleets and they cannot be deleted. To remove those fleets, delete the resource syncs from the related repositories inside the "Repositories" tab.`,
              )}
            />
          </StackItem>
        )}
        <StackItem>
          <Table>
            <Thead>
              <Tr>
                <Th>{t('Name')}</Th>
                <Th>{t('Managed by')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {resources.map((resource) => {
                return (
                  <Tr key={resource.metadata.name}>
                    <Td dataLabel={t('Name')}>{(isFleet(resource) && resource.metadata.name) || '-'}</Td>
                    <Td dataLabel={t('Managed by')}>
                      {isFleet(resource) ? (
                        <FleetOwnerLink owner={resource.metadata.owner} />
                      ) : (
                        <RSLink rsName={resource.metadata.name || ''} />
                      )}
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

export default MassDeleteFleetModal;
