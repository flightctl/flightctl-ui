import * as React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';

type ErrorAlertProps = {
  error: unknown;
  onRetry?: VoidFunction;
};

const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  const { t } = useTranslation();
  return (
    <Alert
      isInline
      variant="danger"
      title={t('Unexpected error occurred')}
      actionLinks={onRetry ? <AlertActionLink onClick={onRetry}>{t('Try again')}</AlertActionLink> : undefined}
    >
      {getErrorMessage(error)}
    </Alert>
  );
};

export default ErrorAlert;
