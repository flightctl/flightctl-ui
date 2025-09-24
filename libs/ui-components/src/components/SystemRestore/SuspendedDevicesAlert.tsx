import * as React from 'react';
import { Trans } from 'react-i18next';
import { Alert, AlertActionLink, Stack, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import MassResumeDevicesModal from '../modals/massModals/ResumeDevicesModal/MassResumeDevicesModal';
import ResumeDevicesModal from '../modals/ResumeDevicesModal/ResumeDevicesModal';
import { DeviceResumeRequest } from '@flightctl/types';

export type ResumeMode = 'global' | 'device' | 'fleet';

type ModalType = 'mass' | 'confirm';

interface SuspendedDevicesAlertProps {
  mode: ResumeMode;
  suspendedCount?: number;
  extraAction?: {
    actionText: string;
    title: React.ReactNode;
    requestSelector: DeviceResumeRequest;
  };
  onResumeComplete?: VoidFunction;
}

const SuspendedDevicesAlert = ({
  mode,
  suspendedCount = 0,
  extraAction,
  onResumeComplete,
}: SuspendedDevicesAlertProps) => {
  const { t } = useTranslation();
  const [isMassModalOpen, setIsMassModalOpen] = React.useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);

  const openResumeModal = React.useCallback((modalType: ModalType) => {
    if (modalType === 'mass') {
      setIsMassModalOpen(true);
    } else {
      setIsConfirmModalOpen(true);
    }
  }, []);

  const closeResumeModal = React.useCallback(
    (modalType: ModalType, hasResumed?: boolean) => {
      if (hasResumed) {
        onResumeComplete?.();
      }
      if (modalType === 'mass') {
        setIsMassModalOpen(false);
      } else {
        setIsConfirmModalOpen(false);
      }
    },
    [onResumeComplete],
  );

  const getMainMessage = () => {
    const suspendedCountStr = suspendedCount.toString();
    switch (mode) {
      case 'device':
        return t(
          "This device is suspended because its local configuration is newer than the server's record. It will not receive updates until it is resumed.",
        );
      case 'fleet':
        return (
          <Trans t={t} count={suspendedCount}>
            <strong>{suspendedCountStr}</strong> <strong>devices in this fleet</strong> are suspended because their
            local configuration is newer than the server&apos;s record. These devices will not receive updates until
            they are resumed.
          </Trans>
        );
      default:
        return (
          <Trans t={t} count={suspendedCount}>
            <strong>{suspendedCountStr}</strong> devices are suspended because their local configuration is newer than
            the server&apos;s record. These devices will not receive updates until they are resumed.
          </Trans>
        );
    }
  };

  const getActions = () => {
    const actionButtons: React.ReactElement[] = [];

    if (extraAction) {
      actionButtons.push(
        <AlertActionLink key="extra-resume-action" onClick={() => openResumeModal('confirm')}>
          {extraAction.actionText}
        </AlertActionLink>,
      );
    }

    actionButtons.push(
      <AlertActionLink key="resume-suspended-devices" onClick={() => openResumeModal('mass')}>
        {t('Resume suspended devices')}
      </AlertActionLink>,
    );

    return actionButtons;
  };

  return (
    <>
      <Alert variant="danger" isInline title={t('Suspended devices detected')} actionLinks={getActions()}>
        <Stack hasGutter>
          <StackItem>{getMainMessage()}</StackItem>
          <StackItem>
            {mode === 'fleet' ? (
              <Trans t={t}>
                <strong>Warning:</strong> Please review this fleet&apos;s configuration before taking action. Resuming a
                device will cause it to apply the current specification, which may be older than what is on the device.
              </Trans>
            ) : (
              <Trans t={t}>
                <strong>Warning:</strong> Please review device configurations before taking action. Resuming a device
                will cause it to apply the current specification, which may be older than what is on the device.
              </Trans>
            )}
          </StackItem>
        </Stack>
      </Alert>
      {isMassModalOpen && (
        <MassResumeDevicesModal
          onClose={(hasResumed) => {
            closeResumeModal('mass', hasResumed);
          }}
        />
      )}
      {isConfirmModalOpen && extraAction && (
        <ResumeDevicesModal
          mode={mode === 'global' ? 'device' : mode}
          title={extraAction.title}
          selector={extraAction.requestSelector}
          expectedCount={suspendedCount}
          onClose={(hasResumed) => {
            closeResumeModal('confirm', hasResumed);
          }}
        />
      )}
    </>
  );
};

export default SuspendedDevicesAlert;
