import * as React from 'react';
import {
  Alert,
  Button,
  Modal /* data-codemods */,
  ModalBody /* data-codemods */,
  ModalFooter /* data-codemods */,
  ModalHeader /* data-codemods */,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Device, DeviceDecommission, DeviceDecommissionTargetType } from '@flightctl/types';

import { getErrorMessage } from '../../../../utils/error';
import { useFetch } from '../../../../hooks/useFetch';
import { useTranslation } from '../../../../hooks/useTranslation';
import { isPromiseRejected } from '../../../../types/typeUtils';
import ResourceLink from '../../../common/ResourceLink';

type MassDecommissionDeviceModalProps = {
  devices: Array<Device>;
  onClose: VoidFunction;
  onSuccess: VoidFunction;
};

const MassDecommissionDeviceModal = ({ onClose, devices, onSuccess }: MassDecommissionDeviceModalProps) => {
  const { t } = useTranslation();
  const [progress, setProgress] = React.useState(0);
  const [totalProgress, setTotalProgress] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>();
  const { put } = useFetch();

  const decommissionDevices = async () => {
    setProgress(0);
    setIsSubmitting(true);
    const promises = devices.map(async (dev) => {
      await put<DeviceDecommission>(`devices/${dev.metadata.name}/decommission`, {
        target: DeviceDecommissionTargetType.DeviceDecommissionTargetTypeUnenroll,
      });
      setProgress((p) => p + 1);
    });
    setTotalProgress(promises.length);
    const results = await Promise.allSettled(promises);
    setIsSubmitting(false);

    const rejectedResults = results.filter(isPromiseRejected);

    if (rejectedResults.length) {
      setErrors(rejectedResults.map((r) => getErrorMessage(r.reason)));
    } else {
      onSuccess();
    }
  };

  return (
    <Modal isOpen onClose={isSubmitting ? undefined : onClose} variant="medium">
      <ModalHeader title={t('Decommission devices ?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{t('Are you sure you want to proceed with decommissioning these devices?')}</StackItem>
          <StackItem>
            {t(
              'Decommissioned devices will not be able to communicate with the edge management system anymore, and they will be removed from any fleet they were associated to. Once decommissioned, the devices cannot be managed further.',
            )}
          </StackItem>
          <StackItem>
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('Alias')}</Th>
                  <Th>{t('Name')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {devices.map((device) => {
                  return (
                    <Tr key={device.metadata.name}>
                      <Td dataLabel={t('Alias')}>{device.metadata.labels?.alias || '-'}</Td>
                      <Td dataLabel={t('Name')}>
                        <ResourceLink id={device.metadata.name as string} />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </StackItem>
          {isSubmitting && (
            <StackItem>
              <Progress
                value={progress}
                min={0}
                max={totalProgress}
                title={t('Decommissioning...')}
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
        <Button
          key="decommission"
          variant="danger"
          onClick={decommissionDevices}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {t('Decommission')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MassDecommissionDeviceModal;
