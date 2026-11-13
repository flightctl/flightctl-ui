import * as React from 'react';

import { NavItem as PFNavItem } from '@patternfly/react-core';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigationGuard } from '../common/NavigationGuardContext';

type ActiveChildrenProps = {
  isActive: boolean;
  children: React.ReactNode;
  setIsActive: (isActive: boolean) => void;
};

const ActiveChildren: React.FC<ActiveChildrenProps> = ({ isActive, children, setIsActive }) => {
  React.useEffect(() => {
    setIsActive(isActive);
  }, [isActive, setIsActive]);
  return children;
};

const NavItem = ({ to, children }: React.PropsWithChildren<{ to: string }>) => {
  const {
    router: { NavLink, useNavigate: useRouterNavigate },
  } = useAppContext();
  const { tryNavigate } = useNavigationGuard();
  const navigate = useRouterNavigate();
  const [isActive, setIsActive] = React.useState(false);
  return (
    <PFNavItem
      id={to}
      isActive={isActive}
      onClick={(event) => {
        const ev = event as unknown as React.MouseEvent;
        ev.preventDefault();
        tryNavigate(() => navigate(to));
      }}
    >
      <NavLink to={to}>
        {({ isActive }) => (
          <ActiveChildren setIsActive={setIsActive} isActive={isActive}>
            {children}
          </ActiveChildren>
        )}
      </NavLink>
    </PFNavItem>
  );
};

export default NavItem;
