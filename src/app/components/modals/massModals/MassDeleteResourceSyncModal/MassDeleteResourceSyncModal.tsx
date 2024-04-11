import { Alert, Button, Modal, Progress, ProgressMeasureLocation, Stack, StackItem } from '@patternfly/react-core';
import { ResourceSync } from '@types';
import * as React from 'react';
import { getErrorMessage } from '@app/utils/error';
import { useFetch } from '@app/hooks/useFetch';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>();
  const { remove } = useFetch();

  const deleteResources = async () => {
    setIsDeleting(true);
    setProgress(0);
    const promises = resources.map(async (r) => {
      await remove('resourcesyncs', r.metadata.name || '');
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
      title={t('Delete resource syncs')}
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
        <StackItem>{t('Are you sure you want to delete the following resource syncs ?')}</StackItem>
        <StackItem>
          <Table>
            <Thead>
              <Tr>
                <Th>{t('Name')}</Th>
                <Th>{t('Revision')}</Th>
                <Th>{t('Path')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {resources.map((resource) => {
                return (
                  <Tr key={resource.metadata.name}>
                    <Td dataLabel={t('Name')}>{resource.metadata.name || '-'}</Td>
                    <Td dataLabel={t('Target revision')}>{resource.spec.targetRevision || '-'}</Td>
                    <Td dataLabel={t('Path')}>{resource.spec.path || '-'}</Td>
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

export default MassDeleteResourceSyncModal;
