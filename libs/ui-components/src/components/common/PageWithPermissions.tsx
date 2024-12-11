import * as React from 'react';
import { Spinner } from '@patternfly/react-core';
import AccessDenied from './AccessDenied';

const PageWithPermissions = ({
  children,
  loading,
  allowed,
}: React.PropsWithChildren<{ loading: boolean; allowed: boolean }>) => {
  if (loading) {
    return <Spinner size="lg" />;
  }
  if (!allowed) {
    return <AccessDenied />;
  }
  return children;
};

export default PageWithPermissions;
