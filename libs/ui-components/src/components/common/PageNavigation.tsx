import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadContent,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { AuthType } from '../../types/extraTypes';
import { OAUTH_REDIRECT_AFTER_LOGIN_KEY } from '../../constants';
import WithTooltip from './WithTooltip';
import { useOrganizationGuardContext } from './OrganizationGuard';
import OrganizationSelector from './OrganizationSelector';
import CopyLoginCommandModal from './CopyLoginCommandModal';

import './PageNavigation.css';

type OrganizationDropdownProps = {
  organizationName?: string;
  onSwitchOrganization: () => void;
};

const OrganizationDropdown = ({ organizationName, onSwitchOrganization }: OrganizationDropdownProps) => {
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
          onClick={onDropdownToggle}
          id="organizationMenu"
          isFullHeight
          isExpanded={isDropdownOpen}
          variant="plainText"
        >
          {organizationName}
        </MenuToggle>
      )}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        <DropdownItem onClick={onSwitchOrganization}>{t('Change Organization')}</DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

const PageNavigation = ({ authType }: { authType: AuthType }) => {
  const { t } = useTranslation();
  const { proxyFetch } = useFetch();
  const { currentOrganization, availableOrganizations } = useOrganizationGuardContext();
  const [showOrganizationModal, setShowOrganizationModal] = React.useState(false);
  const [showCopyLoginCommandModal, setShowCopyLoginCommandModal] = React.useState(false);

  const showOrganizationSelection = availableOrganizations.length > 1;
  const currentOrgDisplayName = currentOrganization?.spec?.displayName || currentOrganization?.metadata?.name || '';
  const isAuthTypeWithModal = authType === AuthType.K8S;

  if (authType === AuthType.DISABLED) {
    return null;
  }

  const onCopyLoginCommand = async () => {
    if (isAuthTypeWithModal) {
      setShowCopyLoginCommandModal(true);
    } else {
      // A new tab will open, and it will require the user to login in again, so that a new login token is created.
      // After login, the new tab will redirect the user to the copy login command page
      const response = await proxyFetch('/login/create-session-token', { credentials: 'include' });
      const { url } = (await response.json()) as { url: string };
      localStorage.setItem(OAUTH_REDIRECT_AFTER_LOGIN_KEY, 'copy-login-command');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <PageSection variant="light" padding={{ default: 'noPadding' }}>
        <Masthead id="global-actions-masthead">
          <MastheadContent>
            <Toolbar isFullHeight isStatic className="fctl-subnav_toolbar">
              <ToolbarContent>
                <ToolbarItem>
                  <WithTooltip
                    showTooltip={!isAuthTypeWithModal}
                    content={t('You will be directed to login in order to generate your login token command')}
                  >
                    <Button
                      variant="link"
                      icon={isAuthTypeWithModal ? undefined : <ExternalLinkAltIcon />}
                      onClick={onCopyLoginCommand}
                    >
                      {' '}
                      {t('Get login command')}
                    </Button>
                  </WithTooltip>
                </ToolbarItem>
                {showOrganizationSelection && (
                  <ToolbarItem>
                    <OrganizationDropdown
                      organizationName={currentOrgDisplayName}
                      onSwitchOrganization={() => {
                        setShowOrganizationModal(true);
                      }}
                    />
                  </ToolbarItem>
                )}
              </ToolbarContent>
            </Toolbar>
          </MastheadContent>
        </Masthead>
      </PageSection>

      {showOrganizationModal && (
        <OrganizationSelector
          isFirstLogin={false}
          onClose={(isChanged) => {
            setShowOrganizationModal(false);
            if (isChanged) {
              window.location.reload();
            }
          }}
        />
      )}
      {/* For the OCP plugin, we just show a modal. We'll obtain the External API URL and display the login command */}
      {showCopyLoginCommandModal && <CopyLoginCommandModal onClose={() => setShowCopyLoginCommandModal(false)} />}
    </>
  );
};

export default PageNavigation;
