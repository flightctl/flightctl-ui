import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Nav, NavExpandable, NavItem, NavList } from '@patternfly/react-core';

import { ExtendedRouteObject, appRouteSections } from '@app/routes';
import { UserPreferencesContext } from '../UserPreferences/UserPreferencesProvider';

import './AppNavigation.css';

const SectionRoute = ({ route }: { route: ExtendedRouteObject }) => {
  const { experimentalFeatures } = React.useContext(UserPreferencesContext);
  if (route.showInNav === false) {
    return null;
  }
  if (route.isExperimental && !experimentalFeatures) {
    return null;
  }
  return (
    <NavItem id={route.path} key={route.path}>
      <NavLink to={route.path || ''}>{route.title}</NavLink>
    </NavItem>
  );
};

const AppNavigation = () => {
  if (!appRouteSections) {
    return null;
  }

  return (
    <Nav id="flightclt-nav" theme="dark">
      <NavList id="flightclt-navlist">
        {Object.entries(appRouteSections).map(([sectionName, sectionRoutes]) => (
          <NavExpandable key={sectionName} id={sectionName} title={sectionName}>
            {sectionRoutes.map((route) => (
              <SectionRoute key={route.path} route={route} />
            ))}
          </NavExpandable>
        ))}
      </NavList>
    </Nav>
  );
};

export default AppNavigation;
