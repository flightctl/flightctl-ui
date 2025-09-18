import * as React from 'react';
import { Alert, Button, Modal, ModalVariant, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import { DeviceResumeRequest, DeviceResumeResponse } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';

interface ResumeDeviceModalProps {
  mode: 'device' | 'fleet';
  title: React.ReactNode;
  selector: DeviceResumeRequest;
  expectedCount: number;
  onClose: (hasResumed: boolean | undefined) => void;
}

/**
 * Modal to resume an individual device, or all the devices in a fleet
 */
const ResumeDevicesModal = ({ mode, title, selector, expectedCount = 1, onClose }: ResumeDeviceModalProps) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [resumedCount, setResumedCount] = React.useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | undefined>(undefined);
  const hasResumed = Boolean(resumedCount && resumedCount > 0);

  const pluralCount = mode === 'device' ? 1 : 2; // Used to generate translations for one/multiple cases

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      const resumeResponse = await post<DeviceResumeRequest, DeviceResumeResponse>('deviceactions/resume', selector);
      setResumedCount(resumeResponse.resumedDevices || 0);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={t('Resume devices?', { count: pluralCount })}
      isOpen
      onClose={() => onClose(hasResumed)}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={handleConfirm}
          isLoading={isSubmitting}
          isDisabled={isSubmitting || resumedCount !== undefined}
        >
          {mode === 'device' ? t('Resume') : t('Resume all')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => onClose(hasResumed)} isDisabled={isSubmitting}>
          {hasResumed ? t('Close') : t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text>{title}</Text>
          </TextContent>
        </StackItem>

        <StackItem>
          <TextContent>
            <Text>
              {t(
                "This action will resolve the configuration conflict and allow the devices to receive new updates from the server. This action is irreversible, please ensure the devices' assigned configuration is correct before proceeding.",
                { count: pluralCount },
              )}
            </Text>
          </TextContent>
        </StackItem>

        {submitError && (
          <StackItem>
            <Alert isInline variant="danger" title={t('Resuming devices failed', { count: pluralCount })}>
              {submitError}
            </Alert>
          </StackItem>
        )}

        {resumedCount === expectedCount && (
          <StackItem>
            <Alert isInline variant="success" title={t('Resume successful')}>
              {t('All {{ resumedCount }} devices resumed successfully', { resumedCount })}
            </Alert>
          </StackItem>
        )}

        {resumedCount != undefined && resumedCount !== expectedCount && (
          <StackItem>
            <Alert isInline variant="warning" title={t('Resume with warnings')}>
              {t('{{ expectedCount }} devices to resume, and {{ resumedCount }} resumed successfully', {
                expectedCount,
                resumedCount,
              })}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default ResumeDevicesModal;
