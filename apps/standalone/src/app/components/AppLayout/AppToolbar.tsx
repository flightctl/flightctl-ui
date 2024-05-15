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
import { useAuth } from '../../hooks/useAuth';

import './AppToolbar.css';
import UserPreferencesModal from '@flightctl/ui-components/src/components/UserPreferences/UserPreferencesModal';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';

type UserDropdownProps = {
  children?: React.ReactNode;
  username?: string;
  onUserPreferences: VoidFunction;
};

const UserDropdown: React.FC<UserDropdownProps> = ({ children, username = 'User', onUserPreferences }) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const onDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
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
          {username}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem onClick={onUserPreferences}>{t('User preferences')}</DropdownItem>
        {children}
      </DropdownList>
    </Dropdown>
  );
};

const AppToolbar = () => {
  const { t } = useTranslation();
  const [preferencesModalOpen, setPreferencesModalOpen] = React.useState(false);
  const auth = useAuth();
  const onUserPreferences = () => setPreferencesModalOpen(true);

  let userDropdown = <UserDropdown onUserPreferences={onUserPreferences} />;

  if (auth) {
    if (auth.user) {
      userDropdown = (
        <UserDropdown username={auth.user.profile.preferred_username} onUserPreferences={onUserPreferences}>
          <DropdownItem key="logout" onClick={() => void auth.signoutRedirect()}>
            {t('Logout')}
          </DropdownItem>
        </UserDropdown>
      );
    } else {
      userDropdown = (
        <Button variant="link" onClick={() => void auth.signinRedirect()}>
          {t('Log in')}
        </Button>
      );
    }
  }

  return (
    <Toolbar isFullHeight isStatic className="fctl-app_toolbar">
      <ToolbarContent>
        <ToolbarItem>{userDropdown}</ToolbarItem>
      </ToolbarContent>
      {preferencesModalOpen && <UserPreferencesModal onClose={() => setPreferencesModalOpen(!preferencesModalOpen)} />}
    </Toolbar>
  );
};

export default AppToolbar;
