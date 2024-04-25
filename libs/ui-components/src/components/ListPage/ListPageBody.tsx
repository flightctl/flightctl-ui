import { getErrorMessage } from '../../utils/error';
import { Alert, Bullseye, Spinner } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

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
  return children;
};

export default ListPageBody;
