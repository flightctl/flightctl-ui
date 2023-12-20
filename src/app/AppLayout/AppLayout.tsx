import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Avatar,
  Brand,
  Button,
  Masthead,
  MastheadBrand,
  MastheadMain,
  MastheadToggle,
	Nav,
  NavExpandable,
  NavItem,
	NavList,
	Page,
	PageSidebar,
  PageSidebarBody,
	SkipToContent
} from '@patternfly/react-core';
import { IAppRoute, IAppRouteGroup, routes } from '@app/routes';
import logo from '@app/bgimages/flightctl-logo.svg';
import { BarsIcon } from '@patternfly/react-icons';
import { useAuth } from 'react-oidc-context';
interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const auth = useAuth();

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const Header = (
    <Masthead>
      <MastheadToggle>
        <Button variant="plain" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Global navigation">
          <BarsIcon />
        </Button>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand>
          <Brand src={logo} alt="FlightControl Logo" heights={{ default: '36px' }} />
        </MastheadBrand>
      </MastheadMain>
      {auth.user ? (
        <div style={{ marginLeft: 'auto' }} id="userWelcome">
           {auth.user?.profile.preferred_username}{' '}
          <Button
            variant="link"
            onClick={() =>
              void auth.signoutRedirect()
            }
          >
            Log out
          </Button>
        </div>
      ) : (
        <div style={{ marginLeft: 'auto' }} id="userWelcome">
          <Button variant="link" onClick={() => void auth.signinRedirect()}>
            Log in
          </Button>
        </div>
      )}
    </Masthead>
  );

  const location = useLocation();

  const renderNavItem = (route: IAppRoute, index: number) => (
    <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`} isActive={route.path === location.pathname}>
      <NavLink exact={route.exact} to={route.path}>
        {route.label}
      </NavLink>
    </NavItem>
  );

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number) => (
    <NavExpandable
      key={`${group.label}-${groupIndex}`}
      id={`${group.label}-${groupIndex}`}
      title={group.label}
      isActive={group.routes.some((route) => route.path === location.pathname)}
    >
      {group.routes.map((route, idx) => route.label && renderNavItem(route, idx))}
    </NavExpandable>
  );

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      <NavList id="nav-list-simple">
        {routes.map(
          (route, idx) => route.label && (!route.routes ? renderNavItem(route, idx) : renderNavGroup(route, idx))
        )}
      </NavList>
    </Nav>
  );

  const Sidebar = (
    <PageSidebar theme="dark" >
      <PageSidebarBody>
        {Navigation}
      </PageSidebarBody>
    </PageSidebar>
  );

  const pageId = 'primary-app-container';

  const PageSkipToContent = (
    <SkipToContent onClick={(event) => {
      event.preventDefault();
      const primaryContentContainer = document.getElementById(pageId);
      primaryContentContainer && primaryContentContainer.focus();
    }} href={`#${pageId}`}>
      Skip to Content
    </SkipToContent>
  );
  return (
    <Page
      mainContainerId={pageId}
      header={Header}
      sidebar={sidebarOpen && Sidebar}
      skipToContent={PageSkipToContent}>
      {children}
    </Page>
  );
};

export { AppLayout };
