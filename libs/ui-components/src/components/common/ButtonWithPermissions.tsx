import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import { AccessReviewResult } from '../../hooks/useAccessReview';

const ButtonWithPermissions = ({
  permissions,
  children,
  ...rest
}: ButtonProps & { permissions: AccessReviewResult }) => {
  const [allowed] = permissions;
  return allowed && <Button {...rest}>{children}</Button>;
};

export default ButtonWithPermissions;
