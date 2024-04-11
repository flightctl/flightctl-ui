import { getErrorMessage } from '@app/utils/error';
import { Alert, Bullseye, Spinner } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

type ListPageBodyProps = {
  error: unknown;
  loading: boolean;
  children: React.ReactNode;
};

const ListPageBody: React.FC<ListPageBodyProps> = ({ error, loading, children }) => {
  const { t } = useTranslation();
  if (error) {
    return (
      <Alert variant="danger" title={t('An error occured')} isInline>
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
