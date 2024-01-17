import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Avatar,
  Brand,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadBrand,
  MastheadMain,
  MastheadToggle,
  MastheadContent,
	MenuToggle,
  MenuToggleElement,
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
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const onDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const onDropdownSelect = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const userDropdownItems = [
    <>
      <DropdownItem key="profile">My profile</DropdownItem>
      <DropdownItem key="logout"               onClick={() =>
                void auth.signoutRedirect()
              }>Logout</DropdownItem>
    </>
  ];
  const Header = (
    <Masthead id="stack-inline-masthead" display={{ default: 'inline', lg: 'stack', '2xl': 'inline' }}>
            <MastheadMain>
      <MastheadToggle>
        <Button variant="plain" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Global navigation">
          <BarsIcon />
        </Button>
      </MastheadToggle>

        <MastheadBrand>
          <Brand src={logo} alt="FlightControl Logo" heights={{ default: '30px' }} />
        </MastheadBrand>
        </MastheadMain>
        <MastheadContent>
      {auth.user ? (
        <div style={{ marginLeft: 'auto' }} id="userWelcome">
        <Dropdown
        isOpen={isDropdownOpen}
        style={{ marginLeft: 'auto'}} 
        onSelect={onDropdownSelect}
        onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
        popperProps={{ position: 'end' }}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle 
            ref={toggleRef}
            icon={<Avatar src="images/avatarimg.svg" alt="avatar" size="md" />} 
            
            onClick={onDropdownToggle} 
            id="userMenu" 
            isFullHeight 
            isExpanded={isDropdownOpen} 
            variant="plainText" 
          >
          
          {auth.user?.profile.preferred_username}  

          </MenuToggle>
        )}
        >
           <DropdownList>{userDropdownItems}</DropdownList>
          </Dropdown>
          </div>
      ) : (
        <div style={{ marginLeft: 'auto' }} id="userWelcome">
          <Button variant="link" onClick={() => void auth.signinRedirect()}>
            Log in
          </Button>
        </div>
      )}
      </MastheadContent>
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
