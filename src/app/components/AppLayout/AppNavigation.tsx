import * as React from 'react';
import { Nav, NavList } from '@patternfly/react-core';

import { appRoutes } from '@app/routes';

import NavItem from '../NavItem/NavItem';

const AppNavigation = () => (
  <Nav id="flightclt-nav" theme="dark">
    <NavList id="flightclt-navlist">
      {appRoutes
        .filter((route) => route.showInNav)
        .map((route) => (
          <NavItem key={route.path} to={route.path || ''}>
            {route.title}
          </NavItem>
        ))}
    </NavList>
  </Nav>
);

export default AppNavigation;
