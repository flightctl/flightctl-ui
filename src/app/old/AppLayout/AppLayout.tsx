import * as React from 'react';
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
  PageToggleButton,
  SkipToContent,
} from '@patternfly/react-core';
import logo from '@app/old/bgimages/flightctl-logo.svg';
import { BarsIcon } from '@patternfly/react-icons';
import { useAuth } from 'react-oidc-context';
import { Outlet } from "react-router-dom";

import AppNavigation from './AppNavigation';

const AppLayout: React.FunctionComponent = () => {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const onSidebarToggle  = () => {
    setIsSidebarOpen((prevIsOpen) => !prevIsOpen)
  }

  const onDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const userDropdownItems = [
      <DropdownItem key="profile">My profile</DropdownItem>,
      <DropdownItem key="logout"               onClick={() =>
                void auth.signoutRedirect()
              }>Logout</DropdownItem>
  ];
  const Header = (
    <Masthead id="stack-inline-masthead" display={{ default: 'inline', lg: 'stack', '2xl': 'inline' }}>
            <MastheadMain>
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={onSidebarToggle}
          id="page-toggle-button"
        >
          <BarsIcon />
        </PageToggleButton>
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
        onSelect={onDropdownToggle}
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

  const Sidebar = (
    <PageSidebar theme="dark" isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
        <AppNavigation />
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
      sidebar={Sidebar}
      isManagedSidebar
      skipToContent={PageSkipToContent}>
      <Outlet />
    </Page>
  );
};

export { AppLayout };
