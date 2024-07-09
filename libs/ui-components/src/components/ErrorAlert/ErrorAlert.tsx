import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';

const ErrorAlert = ({ error }: { error: unknown }) => {
  const { t } = useTranslation();
  return (
    <Alert isInline variant="danger" title={t('Unexpected error occurred')}>
      {getErrorMessage(error)}
    </Alert>
  );
};

export default ErrorAlert;
