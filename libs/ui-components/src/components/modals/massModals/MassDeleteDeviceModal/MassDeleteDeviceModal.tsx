import { Alert, Button, Modal, Progress, ProgressMeasureLocation, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { getErrorMessage } from '../../../../utils/error';
import { useFetch } from '../../../../hooks/useFetch';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DeviceLikeResource, isEnrollmentRequest } from '../../../../types/extraTypes';
import { useTranslation } from '../../../../hooks/useTranslation';
import { isPromiseRejected } from '../../../../types/typeUtils';
import ResourceLink from '../../../common/ResourceLink';

type MassDeleteDeviceModalProps = {
  onClose: VoidFunction;
  resources: Array<DeviceLikeResource>;
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
      await remove(`${isEnrollmentRequest(r) ? 'enrollmentrequests' : 'devices'}/${r.metadata.name}`);
      setProgress((p) => p + 1);
    });
    setTotalProgress(promises.length);
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
                <Th>{t('Name')}</Th>
                <Th>{t('Alias')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {resources.map((resource) => {
                return (
                  <Tr key={resource.metadata.name}>
                    <Td dataLabel={t('Name')}>
                      <ResourceLink id={resource.metadata.name as string} />
                    </Td>
                    <Td dataLabel={t('Alias')}>{resource.metadata.labels?.alias || '-'}</Td>
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

export default MassDeleteDeviceModal;
