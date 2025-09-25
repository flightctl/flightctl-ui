import * as React from 'react';
import { Button, Modal, ModalVariant, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { useTranslation } from '../../../../hooks/useTranslation';

interface ResumeAllDevicesConfirmationModalProps {
  deviceCountNum: number;
  onClose: (doConfirm: boolean) => void;
  isSubmitting?: boolean;
}

const ResumeAllDevicesConfirmationModal = ({ deviceCountNum, onClose }: ResumeAllDevicesConfirmationModalProps) => {
  const { t } = useTranslation();

  const deviceCount = deviceCountNum.toString();

  return (
    <Modal
      variant={ModalVariant.small}
      title={t('Resume all {{ deviceCount }} devices?', { deviceCount })}
      isOpen
      onClose={() => onClose(false)}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => onClose(true)}>
          {t('Resume all devices')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => onClose(false)}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text>
              <Trans t={t} count={deviceCountNum}>
                You are about to resume all <strong>{deviceCount}</strong> suspended devices.
              </Trans>
            </Text>
          </TextContent>
          <TextContent>
            <Text>
              {t(
                'This action is irreversible and will allow all affected devices to receive new configuration updates from the server.',
              )}
            </Text>
          </TextContent>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export default ResumeAllDevicesConfirmationModal;
