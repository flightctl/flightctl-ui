import { getErrorMessage } from '@app/utils/error';
import { Alert, Bullseye, Spinner } from '@patternfly/react-core';
import * as React from 'react';

type ListPageBodyProps = {
  error: unknown;
  loading: boolean;
  data: unknown[] | undefined;
  children: React.ReactNode;
  emptyState: React.ReactNode;
};

const ListPageBody: React.FC<ListPageBodyProps> = ({ error, loading, data, children, emptyState }) => {
  if (error) {
    return (
      <Alert variant="danger" title="An error occured" isInline>
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

  if (!data) {
    return emptyState;
  }

  return children;
};

export default ListPageBody;
