import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useAuth } from '@app/hooks/useAuth';
import { ThemeContext } from '../ThemeProvider/ThemeProvider';

import './AppToolbar.css';

const AppToolbar = () => {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { theme, setTheme } = React.useContext(ThemeContext);
  const onDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <Toolbar isFullHeight isStatic className="fctl-app_toolbar">
      <ToolbarContent>
        <ToolbarItem>
          <Button
            aria-label="Theme switch"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            icon={theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            variant="plain"
          />
        </ToolbarItem>
        {auth && (
          <ToolbarItem>
            {auth.user ? (
              <Dropdown
                isOpen={isDropdownOpen}
                onSelect={onDropdownToggle}
                onOpenChange={setIsDropdownOpen}
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
                <DropdownList>
                  {[
                    <DropdownItem key="profile">My profile</DropdownItem>,
                    <DropdownItem key="logout" onClick={() => void auth.signoutRedirect()}>
                      Logout
                    </DropdownItem>,
                  ]}
                </DropdownList>
              </Dropdown>
            ) : (
              <Button variant="link" onClick={() => void auth.signinRedirect()}>
                Log in
              </Button>
            )}
          </ToolbarItem>
        )}
      </ToolbarContent>
    </Toolbar>
  );
};

export default AppToolbar;
