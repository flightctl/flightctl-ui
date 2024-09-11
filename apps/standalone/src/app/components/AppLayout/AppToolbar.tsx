import {
  Alert,
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Modal,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';

import UserPreferencesModal from '@flightctl/ui-components/src/components/UserPreferences/UserPreferencesModal';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { getErrorMessage } from '@flightctl/ui-components/src/utils/error';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../utils/apiCalls';

import './AppToolbar.css';

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
  const { username, authEnabled } = React.useContext(AuthContext);
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const [logoutErr, setLogoutErr] = React.useState<string>();
  const onUserPreferences = () => setPreferencesModalOpen(true);

  let userDropdown = <UserDropdown onUserPreferences={onUserPreferences} />;

  if (authEnabled) {
    if (username) {
      userDropdown = (
        <UserDropdown username={username} onUserPreferences={onUserPreferences}>
          <DropdownItem
            onClick={async () => {
              try {
                setLogoutErr(undefined);
                setLogoutLoading(true);
                await logout();
              } catch (err) {
                setLogoutErr(getErrorMessage(err));
              }
            }}
            isLoading={logoutLoading}
          >
            {t('Logout')}
          </DropdownItem>
        </UserDropdown>
      );
    }
  }

  return (
    <Toolbar isFullHeight isStatic className="fctl-app_toolbar">
      <ToolbarContent>
        <ToolbarItem>{userDropdown}</ToolbarItem>
      </ToolbarContent>
      {preferencesModalOpen && <UserPreferencesModal onClose={() => setPreferencesModalOpen(!preferencesModalOpen)} />}
      {logoutErr && (
        <Modal
          title={t('Failed to logout')}
          isOpen
          onClose={() => setLogoutErr(undefined)}
          actions={[
            <Button key="cancel" variant="link" onClick={() => setLogoutErr(undefined)}>
              Close
            </Button>,
          ]}
        >
          <Alert isInline variant="danger" title={logoutErr} />
        </Modal>
      )}
    </Toolbar>
  );
};

export default AppToolbar;
