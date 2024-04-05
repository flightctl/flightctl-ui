import { getErrorMessage } from '@app/utils/error';
import { Alert, Bullseye, Spinner } from '@patternfly/react-core';
import * as React from 'react';

type ListPageBodyProps = {
  error: unknown;
  loading: boolean;
  children: React.ReactNode;
};

const ListPageBody: React.FC<ListPageBodyProps> = ({ error, loading, children }) => {
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
  return children;
};

export default ListPageBody;
