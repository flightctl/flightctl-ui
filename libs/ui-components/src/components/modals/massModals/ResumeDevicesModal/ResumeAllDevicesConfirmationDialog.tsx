import * as React from 'react';
import { Trans } from 'react-i18next';
import { Alert, Button, Modal, ModalVariant, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import { DeviceResumeRequest, DeviceResumeResponse } from '@flightctl/types';

import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetch } from '../../../../hooks/useFetch';
import { getErrorMessage } from '../../../../utils/error';

interface ResumeAllDevicesConfirmationModalProps {
  devicesToResume: number;
  onClose: (resumedCount: number | undefined) => void;
  isSubmitting?: boolean;
}

const ModalContentBeforeResume = ({ devicesToResume }: { devicesToResume: number }) => {
  const { t } = useTranslation();

  const deviceCount = devicesToResume.toString();
  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text>
            <Trans t={t} count={devicesToResume}>
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
  );
};

const ModalContentAfterResume = ({
  hasResumedAll,
  resumedCount,
  submitError,
}: {
  hasResumedAll: boolean;
  resumedCount: number;
  submitError: string | undefined;
}) => {
  const { t } = useTranslation();
  if (submitError) {
    return (
      <Alert isInline variant="danger" title={t('Resume devices failed')}>
        {submitError}
      </Alert>
    );
  }

  const alertType = hasResumedAll ? 'success' : 'warning';
  const title = hasResumedAll ? t('Resume successful') : t('Resumed with warnings');
  return (
    <Alert isInline variant={alertType} title={title}>
      {t('{{ count }} devices were resumed', { count: resumedCount })}
    </Alert>
  );
};

const ResumeAllDevicesConfirmationModal = ({ devicesToResume, onClose }: ResumeAllDevicesConfirmationModalProps) => {
  const { t } = useTranslation();
  const { post } = useFetch();

  const [resumedCount, setResumedCount] = React.useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | undefined>(undefined);

  const isBeforeResume = resumedCount === undefined;
  const title = isBeforeResume
    ? t('Resume all {{ count }} devices?', { count: devicesToResume })
    : t('Resume devices result');

  const buttons = isBeforeResume
    ? [
        <Button
          key="confirm"
          variant="primary"
          isDisabled={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true);
            try {
              const resumeRequest: DeviceResumeRequest = {
                labelSelector: '', // All devices
              };
              const resumeResponse = await post<DeviceResumeRequest, DeviceResumeResponse>(
                'deviceactions/resume',
                resumeRequest,
              );
              setResumedCount(resumeResponse.resumedDevices || 0);
            } catch (error) {
              setResumedCount(0);
              setSubmitError(getErrorMessage(error));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {t('Resume all devices')}
        </Button>,
        <Button key="cancel" variant="link" isDisabled={isSubmitting} onClick={() => onClose(undefined)}>
          {t('Cancel')}
        </Button>,
      ]
    : [
        <Button key="close" variant="primary" onClick={() => onClose(resumedCount)}>
          {t('Close')}
        </Button>,
      ];

  return (
    <Modal variant={ModalVariant.small} title={title} isOpen onClose={() => onClose(undefined)} actions={buttons}>
      {isBeforeResume ? (
        <ModalContentBeforeResume devicesToResume={devicesToResume} />
      ) : (
        <ModalContentAfterResume
          resumedCount={resumedCount}
          hasResumedAll={resumedCount === devicesToResume}
          submitError={submitError}
        />
      )}
    </Modal>
  );
};

export default ResumeAllDevicesConfirmationModal;
