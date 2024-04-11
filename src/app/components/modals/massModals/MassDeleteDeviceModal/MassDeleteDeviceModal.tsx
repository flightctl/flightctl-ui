import { Alert, Button, Modal, Progress, ProgressMeasureLocation, Stack, StackItem } from '@patternfly/react-core';
import { Device, EnrollmentRequest } from '@types';
import * as React from 'react';
import { getErrorMessage } from '@app/utils/error';
import { useFetch } from '@app/hooks/useFetch';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { getFingerprintDisplay } from '@app/utils/devices';
import { isEnrollmentRequest } from '@app/types/extraTypes';
import { useTranslation } from 'react-i18next';

type MassDeleteDeviceModalProps = {
  onClose: VoidFunction;
  resources: Array<Device | EnrollmentRequest>;
  onDeleteSuccess: VoidFunction;
};

const MassDeleteDeviceModal: React.FC<MassDeleteDeviceModalProps> = ({ onClose, resources, onDeleteSuccess }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = React.useState(0);
  const [totalProgress, setTotalProgress] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>();
  const { remove } = useFetch();

  const deleteResources = async () => {
    setProgress(0);
    setIsDeleting(true);
    const promises = resources.map(async (r) => {
      await remove(`${isEnrollmentRequest(r) ? 'enrollmentrequests' : 'devices'}`, r.metadata.name || '');
      setProgress((p) => p + 1);
    });
    setTotalProgress(promises.length);
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
      title={t('Delete devices')}
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
        <StackItem>{t('Are you sure you want to delete the following devices ?')}</StackItem>
        <StackItem>
          <Table>
            <Thead>
              <Tr>
                <Th>{t('Fingerprint')}</Th>
                <Th>{t('Name')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {resources.map((resource) => {
                return (
                  <Tr key={resource.metadata.name}>
                    <Td dataLabel={t('Fingerprint')}>{getFingerprintDisplay(resource)}</Td>
                    <Td dataLabel={t('Name')}>{resource.metadata.labels?.displayName || '-'}</Td>
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
              max={totalProgress}
              title={t('Approving...')}
              measureLocation={ProgressMeasureLocation.top}
              label={t('{{progress}} of {{totalProgress}}', { progress, totalProgress })}
              valueText={t('{{progress}} of {{totalProgress}}', { progress, totalProgress })}
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

export default MassDeleteDeviceModal;
