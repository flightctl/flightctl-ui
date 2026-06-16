import * as React from 'react';
import {
  Alert,
  Avatar,
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';

import UserPreferencesModal from '@flightctl/ui-components/src/components/Masthead/UserPreferencesModal';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { ROUTE, useNavigate } from '@flightctl/ui-components/src/hooks/useNavigate';

import { useOrganizationGuardContext } from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import { getErrorMessage } from '@flightctl/ui-components/src/utils/error';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../utils/apiCalls';

import './AppToolbar.css';

type UserDropdownProps = {
  username?: string;
  organizationLabel?: string;
  onUserPreferences: VoidFunction;
};

const UserDropdown = ({
  children,
  username = 'User',
  organizationLabel,
  onUserPreferences,
}: React.PropsWithChildren<UserDropdownProps>) => {
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
          className="fctl-app_toolbar-menu__toggle"
          icon={<Avatar src="images/avatarimg.svg" alt="avatar" size="md" />}
          onClick={onDropdownToggle}
          id="userMenu"
          isExpanded={isDropdownOpen}
          variant="plainText"
        >
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsFlexStart' }}>
            <FlexItem data-testid="masthead-username">{username}</FlexItem>
            {organizationLabel && (
              <FlexItem data-testid="masthead-organization">
                <Content component="small">{organizationLabel}</Content>
              </FlexItem>
            )}
          </Flex>
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
  const [helpDropdownOpen, setHelpDropdownOpen] = React.useState<boolean>(false);

  const { username } = React.useContext(AuthContext);
  const { currentOrganization } = useOrganizationGuardContext();
  const organizationLabel = currentOrganization?.label || currentOrganization?.id;
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const [logoutErr, setLogoutErr] = React.useState<string>();
  const onUserPreferences = () => setPreferencesModalOpen(true);
  const navigate = useNavigate();

  let userDropdown = <UserDropdown onUserPreferences={onUserPreferences} />;
  if (username) {
    userDropdown = (
      <UserDropdown username={username} onUserPreferences={onUserPreferences} organizationLabel={organizationLabel}>
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

  return (
    <Toolbar isFullHeight isStatic className="fctl-app_toolbar">
      <ToolbarContent>
        <ToolbarItem>
          <Dropdown
            isOpen={helpDropdownOpen}
            onOpenChange={(open) => setHelpDropdownOpen(open)}
            onSelect={() => setHelpDropdownOpen(false)}
            toggle={(toggleRef) => (
              <MenuToggle
                aria-label={t('Help menu')}
                data-testid="masthead-help-menu"
                ref={toggleRef}
                variant="plain"
                onClick={() => setHelpDropdownOpen(!helpDropdownOpen)}
                isExpanded={helpDropdownOpen}
                icon={<QuestionCircleIcon />}
              />
            )}
            popperProps={{ position: 'right' }}
          >
            <DropdownItem
              data-testid="masthead-command-line-tools"
              onClick={() => {
                navigate(ROUTE.COMMAND_LINE_TOOLS);
              }}
            >
              {t('Command Line Tools')}
            </DropdownItem>
          </Dropdown>
        </ToolbarItem>
        <ToolbarItem>{userDropdown}</ToolbarItem>
      </ToolbarContent>
      {preferencesModalOpen && <UserPreferencesModal onClose={() => setPreferencesModalOpen(false)} />}

      {logoutErr && (
        <Modal isOpen onClose={() => setLogoutErr(undefined)}>
          <ModalHeader title={t('Failed to logout')} />
          <ModalBody>
            <Alert isInline variant="danger" title={logoutErr} />
          </ModalBody>
          <ModalFooter>
            <Button key="cancel" variant="link" onClick={() => setLogoutErr(undefined)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Toolbar>
  );
};

export default AppToolbar;
