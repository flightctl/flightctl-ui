import * as React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';
import type { TFunction } from 'react-i18next';

import type { AppConsoleConnectError } from '../../hooks/useAppConsoleWebSocket';
import { useTranslation } from '../../hooks/useTranslation';
import ConfirmEndAppConsoleSessionModal from './ConfirmEndAppConsoleSessionModal';

const isAppSessionConflictError = (error: AppConsoleConnectError): boolean =>
  error.kind === 'sessionInUse' || error.kind === 'sessionTakenOver';

const getAppConsoleConnectErrorMessage = (error: AppConsoleConnectError, t: TFunction): string => {
  switch (error.kind) {
    case 'sessionInUse':
      return t(
        'Only one serial console session can be active at a time. Another user or browser tab may already be connected to this virtual machine. Close any other active session, then try again.',
      );
    case 'sessionTakenOver':
      return t('This console session was ended because another user connected to the same virtual machine.');
    case 'forbidden':
      return t('You do not have permission to access the virtual machine console.');
    case 'notFound':
      return t('The virtual machine application was not found.');
    case 'timeout':
      return t('Timed out connecting to the virtual machine console. The VM may still be starting.');
    case 'unknownError':
      return t('Failed to connect to the virtual machine console.');
  }
};

const TerminalConnectError = ({
  error,
  onRetry,
  onTakeoverSession,
  appName,
}: {
  error: AppConsoleConnectError;
  onRetry: VoidFunction;
  onTakeoverSession: VoidFunction;
  appName: string;
}) => {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  const hasSessionConflict = isAppSessionConflictError(error);
  const actionLinks = [
    <AlertActionLink key="try-again" onClick={onRetry}>
      {t('Try again')}
    </AlertActionLink>,
  ];
  if (hasSessionConflict) {
    actionLinks.push(
      <AlertActionLink key="end-active-session" onClick={() => setIsConfirmOpen(true)}>
        {t('End active session')}
      </AlertActionLink>,
    );
  }
  return (
    <>
      <Alert
        variant={hasSessionConflict ? 'warning' : 'danger'}
        title={t('Console session unavailable')}
        isInline
        actionLinks={actionLinks}
        data-testid="app-console-connect-error"
      >
        {getAppConsoleConnectErrorMessage(error, t)}
      </Alert>
      {hasSessionConflict && isConfirmOpen && (
        <ConfirmEndAppConsoleSessionModal
          appName={appName}
          onClose={(doConfirm) => {
            setIsConfirmOpen(false);
            if (doConfirm) {
              onTakeoverSession();
            }
          }}
        />
      )}
    </>
  );
};

export default TerminalConnectError;
