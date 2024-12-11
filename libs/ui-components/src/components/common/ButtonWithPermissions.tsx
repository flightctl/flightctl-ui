import { Button, ButtonProps } from '@patternfly/react-core';
import * as React from 'react';

type WithPermissions = {
  permissions: [boolean, boolean, string | undefined];
};

const ButtonWithPermissions = ({ permissions, children, ...rest }: ButtonProps & WithPermissions) => {
  const [allowed] = permissions;
  return allowed && <Button {...rest}>{children}</Button>;
};

export default ButtonWithPermissions;
