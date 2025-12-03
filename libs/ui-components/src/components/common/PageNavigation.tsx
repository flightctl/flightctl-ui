import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Panel,
  PanelMain,
  PanelMainBody,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import CogIcon from '@patternfly/react-icons/dist/js/icons/cog-icon';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { useOrganizationGuardContext } from './OrganizationGuard';
import OrganizationSelector from './OrganizationSelector';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from './PermissionsContext';
import { useAppContext } from '../../hooks/useAppContext';

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

const getRedirectPathAfterOrgSwitch = (pathname: string): string => {
  // If we're currently on a details page for the original organization, return the parent list page.
  const deviceEntityMatch = pathname.match(
    /^\/(edge|devicemanagement)\/(fleets|devices|repositories|enrollmentrequests)\/[^/]+/,
  );
  if (deviceEntityMatch) {
    return `/${deviceEntityMatch[1]}/${deviceEntityMatch[2]}`;
  }

  // In the admin section, currently there's only one option, but we keep it generic for future expansion.
  const adminMatch = pathname.match(/^\/admin\/(authproviders)\/[^/]+/);
  if (adminMatch) {
    const entityType = adminMatch[1];
    return `/admin/${entityType}`;
  }

  return '/overview';
};

const PageNavigation = ({ showSettings = true }: { showSettings?: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { router } = useAppContext();
  const location = router.useLocation();
  const { currentOrganization, availableOrganizations } = useOrganizationGuardContext();
  const { checkPermissions } = usePermissionsContext();
  const [isAdmin] = checkPermissions([{ kind: RESOURCE.AUTH_PROVIDER, verb: VERB.CREATE }]);
  const [showOrganizationModal, setShowOrganizationModal] = React.useState(false);
  const showOrganizationSelection = availableOrganizations.length > 1;
  const currentOrgDisplayName = currentOrganization?.spec?.displayName || currentOrganization?.metadata?.name || '';

  // Show navigation bar if there's either org selection OR admin button to show
  const shouldShowNavigation = showOrganizationSelection || isAdmin;

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <>
      <Panel className="fctl-subnav_panel">
        <PanelMain>
          <PanelMainBody>
            <Toolbar isFullHeight isStatic className="fctl-subnav_toolbar">
              <ToolbarContent>
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
                {isAdmin && showSettings && (
                  <ToolbarItem>
                    <Tooltip content={t('Manage authentication providers')}>
                      <Button
                        variant="link"
                        aria-label={t('Settings')}
                        onClick={() => navigate(ROUTE.AUTH_PROVIDERS)}
                        icon={<CogIcon />}
                      >
                        {t('Settings')}
                      </Button>
                    </Tooltip>
                  </ToolbarItem>
                )}
              </ToolbarContent>
            </Toolbar>
          </PanelMainBody>
        </PanelMain>
      </Panel>

      {showOrganizationModal && (
        <OrganizationSelector
          isFirstLogin={false}
          onClose={(isChanged) => {
            setShowOrganizationModal(false);
            if (isChanged) {
              const targetPath = getRedirectPathAfterOrgSwitch(location.pathname);
              window.location.href = targetPath;
            }
          }}
        />
      )}
    </>
  );
};

export default PageNavigation;
