import * as React from 'react';
import { Alert, Bullseye, Spinner } from '@patternfly/react-core';

import { getErrorMessage } from '../../utils/error';
import { useTranslation } from '../../hooks/useTranslation';
import ErrorBoundary from '../common/ErrorBoundary';

type ListPageBodyProps = {
  error: unknown;
  loading: boolean;
  children: React.ReactNode;
};

const ListPageBody: React.FC<ListPageBodyProps> = ({ error, loading, children }) => {
  const { t } = useTranslation();
  if (error) {
    return (
      <Alert variant="danger" title={t('An error occurred')} isInline>
        {getErrorMessage(error)}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ListPageBody;
