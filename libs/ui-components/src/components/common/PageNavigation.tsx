import * as React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  Masthead,
  MastheadContent,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { AuthType } from '../../types/extraTypes';
import { useOrganizationGuardContext } from './OrganizationGuard';
import OrganizationSelector from './OrganizationSelector';
import CopyLoginCommandModal from './CopyLoginCommandModal';

export const OAUTH_REDIRECT_AFTER_LOGIN_KEY = 'oauthRedirectAfterLogin';

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

  // CELIA-WIP MAKE link clearly clickable with the cursor pointer
  return (
    <>
      <PageSection variant="light" padding={{ default: 'noPadding' }}>
        <Masthead id="global-actions-masthead">
          <MastheadContent>
            <Toolbar isFullHeight isStatic className="fctl-subnav_toolbar">
              <ToolbarContent>
                <ToolbarItem
                  onClick={async () => {
                    if (isAuthTypeWithModal) {
                      setShowCopyLoginCommandModal(true);
                    } else {
                      localStorage.setItem(OAUTH_REDIRECT_AFTER_LOGIN_KEY, 'copy-login-command');
                      // Use CLI token endpoint for CLI authentication flows
                      const response = await proxyFetch('/login/create-session-token', { credentials: 'include' });
                      const { url } = (await response.json()) as { url: string };
                      console.log('%c url', 'color: blue; font-size:18px', url);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  {t('Copy login command')}
                  {!isAuthTypeWithModal && (
                    <Icon className="pf-v5-u-ml-sm">
                      <ExternalLinkAltIcon />
                    </Icon>
                  )}
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
