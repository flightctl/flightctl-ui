import * as React from 'react';
import { Nav, NavList } from '@patternfly/react-core';

import { getAppRoutes } from '../../routes';

import NavItem from '@flightctl/ui-components/src/components/NavItem/NavItem';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';

const AppNavigation = () => {
  const { t } = useTranslation();
  return (
    <Nav id="flightclt-nav" theme="dark">
      <NavList id="flightclt-navlist">
        {getAppRoutes(t)
          .filter((route) => route.showInNav)
          .map((route) => {
            return (
              <NavItem key={route.path} to={route.path || ''}>
                {route.title} {route.navContent}
              </NavItem>
            );
          })}
      </NavList>
    </Nav>
  );
};

export default AppNavigation;
