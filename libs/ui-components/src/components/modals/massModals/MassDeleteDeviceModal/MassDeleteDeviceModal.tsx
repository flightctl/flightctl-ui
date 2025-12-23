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

import { Device, EnrollmentRequest } from '@flightctl/types';
import { isEnrollmentRequest } from '../../../../types/extraTypes';

import { getErrorMessage } from '../../../../utils/error';
import { useFetch } from '../../../../hooks/useFetch';
import { useTranslation } from '../../../../hooks/useTranslation';
import { isPromiseRejected } from '../../../../types/typeUtils';
import ResourceLink from '../../../common/ResourceLink';

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
    <Modal isOpen onClose={isDeleting ? undefined : onClose} variant="medium">
      <ModalHeader title={t('Delete devices ?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{t('Are you sure you want to delete the following devices ?')}</StackItem>
          <StackItem>
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('Alias')}</Th>
                  <Th>{t('Name')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {resources.map((resource) => {
                  return (
                    <Tr key={resource.metadata.name}>
                      <Td dataLabel={t('Alias')}>{resource.metadata.labels?.alias || '-'}</Td>
                      <Td dataLabel={t('Name')}>
                        <ResourceLink id={resource.metadata.name as string} />
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
                max={totalProgress}
                title={t('Deleting...')}
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
      </ModalBody>
      <ModalFooter>
        <Button key="delete" variant="danger" onClick={deleteResources} isLoading={isDeleting} isDisabled={isDeleting}>
          {t('Delete devices')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MassDeleteDeviceModal;
