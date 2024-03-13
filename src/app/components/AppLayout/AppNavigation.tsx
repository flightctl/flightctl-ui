import * as React from 'react';

import { Nav, NavExpandable, NavList } from '@patternfly/react-core';

import { ExtendedRouteObject, appRouteSections } from '@app/routes';
import { UserPreferencesContext } from '../UserPreferences/UserPreferencesProvider';
import NavItem from '../NavItem/NavItem';

const SectionRoute = ({ route }: { route: ExtendedRouteObject }) => {
  const { experimentalFeatures } = React.useContext(UserPreferencesContext);
  if (!route.showInNav) {
    return null;
  }
  if (route.isExperimental && !experimentalFeatures) {
    return null;
  }
  return <NavItem to={route.path || ''}>{route.title}</NavItem>;
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
