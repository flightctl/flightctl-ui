import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { Nav, NavExpandable, NavItem, NavList } from '@patternfly/react-core';

import { ExtendedRouteObject, appRouteSections } from '@app/routes';
import { UserPreferencesContext } from '../UserPreferences/UserPreferencesProvider';

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
  const location = useLocation();
  if (!appRouteSections) {
    return null;
  }

  return (
    <Nav id="nav-primary-simple" theme="dark">
      <NavList id="nav-list-simple">
        {Object.entries(appRouteSections).map(([sectionName, sectionRoutes]) => {
          const isSectionActive = sectionRoutes.some((route) => route.path === location.pathname);
          return (
            <NavExpandable key={sectionName} id={sectionName} title={sectionName} isActive={isSectionActive}>
              {sectionRoutes.map((route) => (
                <SectionRoute key={route.path} route={route} />
              ))}
            </NavExpandable>
          );
        })}
      </NavList>
    </Nav>
  );
};

export default AppNavigation;
