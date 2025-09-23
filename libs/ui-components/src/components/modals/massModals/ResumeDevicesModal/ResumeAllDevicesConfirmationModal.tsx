import * as React from 'react';
import { Button, Modal, ModalVariant, Stack, StackItem, Text, TextContent, Alert } from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { useTranslation } from '../../../../hooks/useTranslation';

interface ResumeAllDevicesConfirmationModalProps {
  deviceCount: number;
  onClose: (doConfirm: boolean) => void;
  isSubmitting?: boolean;
}

const ResumeAllDevicesConfirmationModal = ({ deviceCount, onClose }: ResumeAllDevicesConfirmationModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      variant={ModalVariant.small}
      title={t('Confirm resume all devices')}
      isOpen
      onClose={() => onClose(false)}
      actions={[
        <Button key="confirm" variant="danger" onClick={() => onClose(true)}>
          {t('Resume all devices')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => onClose(false)}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <Alert variant="warning" isInline title={t('Warning: Critical action')}>
            <TextContent>
              <Text>
                {t(
                  'This action will resume ALL suspended devices and cannot be undone. Please confirm that you want to proceed.',
                )}
              </Text>
            </TextContent>
          </Alert>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text>
              <Trans t={t} count={deviceCount}>
                You are about to resume <strong>{deviceCount}</strong> suspended devices. This action is irreversible
                and will immediately allow all affected devices to receive new configuration updates from the server.
              </Trans>
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text>
              {t(
                'Are you sure you want to resume all suspended devices? This cannot be undone and may have significant impact on your fleet.',
              )}
            </Text>
          </TextContent>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export default ResumeAllDevicesConfirmationModal;
