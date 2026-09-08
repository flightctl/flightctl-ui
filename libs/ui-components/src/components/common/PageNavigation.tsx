import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
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
import { useAppContext } from '../../hooks/useAppContext';
import LoginCommandModal from '../modals/LoginCommandModal/LoginCommandModal';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from './PermissionsContext';
import { useQuickStart } from '../QuickStart/QuickStartContext';
import OrganizationSelector from './OrganizationSelector';
import { type OrganizationItem, useOrganizationGuardContext } from './OrganizationGuard';

import './PageNavigation.css';

type OrganizationDisplayProps = {
  organization: OrganizationItem;
  hasSingleOrg: boolean;
  onSwitchOrganization: VoidFunction;
};

const OrganizationDisplay = ({ organization, hasSingleOrg, onSwitchOrganization }: OrganizationDisplayProps) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  if (!organization) {
    return null;
  }

  if (hasSingleOrg) {
    return (
      <Tooltip
        content={
          <>
            <div className="pf-v6-u-font-weight-bold">{t('Organization ID')}</div>
            <div>{organization.id}</div>
          </>
        }
        position="bottom"
        maxWidth="36ch"
        isContentLeftAligned
      >
        <span tabIndex={0} className="fctl-subnav_organization" data-testid="page-navigation-organization">
          {organization.label || t('Default')}
        </span>
      </Tooltip>
    );
  }

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
          data-testid="page-navigation-organization"
          isFullHeight
          isExpanded={isDropdownOpen}
          variant="plainText"
        >
          {organization.label}
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

const listRoutes = [ROUTE.FLEETS, ROUTE.DEVICES, ROUTE.REPOSITORIES, ROUTE.ENROLLMENT_REQUESTS, ROUTE.AUTH_PROVIDERS];

const getRedirectPathAfterOrgSwitch = (pathname: string, appRoutes: Record<ROUTE, string>): string => {
  const routeMapping: Array<{ detailRoutes: ROUTE[]; listRoute: ROUTE }> = [
    { detailRoutes: [ROUTE.FLEET_DETAILS, ROUTE.FLEET_EDIT], listRoute: ROUTE.FLEETS },
    { detailRoutes: [ROUTE.DEVICE_DETAILS, ROUTE.DEVICE_EDIT], listRoute: ROUTE.DEVICES },
    { detailRoutes: [ROUTE.REPO_DETAILS, ROUTE.REPO_EDIT], listRoute: ROUTE.REPOSITORIES },
    { detailRoutes: [ROUTE.ENROLLMENT_REQUEST_DETAILS], listRoute: ROUTE.ENROLLMENT_REQUESTS },
    { detailRoutes: [ROUTE.AUTH_PROVIDER_DETAILS, ROUTE.AUTH_PROVIDER_EDIT], listRoute: ROUTE.AUTH_PROVIDERS },
  ];

  // Map detail/edit routes to their corresponding list routes
  for (const { detailRoutes, listRoute } of routeMapping) {
    for (const detailRoute of detailRoutes) {
      const detailPath = appRoutes[detailRoute];
      if (detailPath && pathname.startsWith(detailPath + '/')) {
        return appRoutes[listRoute];
      }
    }
  }

  // If in a list page, we can stay on the same page
  for (const listRoute of listRoutes) {
    const listPath = appRoutes[listRoute];
    if (listPath && pathname === listPath) {
      return listPath;
    }
  }

  // Default to root/overview
  return appRoutes[ROUTE.ROOT];
};

const SettingsDropdown = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { router } = useAppContext();
  const { panelVisibility, toggleVisibility } = useQuickStart();
  const { checkPermissions } = usePermissionsContext();
  const [canManageAuthProviders] = checkPermissions([{ kind: RESOURCE.AUTH_PROVIDER, verb: VERB.CREATE }]);
  const [isOpen, setIsOpen] = React.useState(false);

  const authProvidersPath = router.appRoutes[ROUTE.AUTH_PROVIDERS];
  const showAuthProvidersItem =
    canManageAuthProviders && authProvidersPath !== '/' && authProvidersPath !== router.appRoutes[ROUTE.ROOT];

  const isGuideHidden = panelVisibility === 'hidden';

  const onToggleQuickStart = () => {
    toggleVisibility();
    setIsOpen(false);
  };

  const onManageAuthProviders = () => {
    navigate(ROUTE.AUTH_PROVIDERS);
    setIsOpen(false);
  };

  const onDropdownToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onDropdownToggle}
          aria-label={t('Settings')}
          isExpanded={isOpen}
          variant="plain"
          icon={<CogIcon />}
        >
          {t('Settings')}
        </MenuToggle>
      )}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        <DropdownItem onClick={onToggleQuickStart}>
          {isGuideHidden ? t('Show quick start guide') : t('Hide quick start guide')}
        </DropdownItem>
        {showAuthProvidersItem && (
          <DropdownItem onClick={onManageAuthProviders}>{t('Manage authentication providers')}</DropdownItem>
        )}
      </DropdownList>
    </Dropdown>
  );
};

const PageNavigation = () => {
  const { t } = useTranslation();
  const { router } = useAppContext();
  const location = router.useLocation();
  const { currentOrganization, availableOrganizations } = useOrganizationGuardContext();
  const [showOrganizationModal, setShowOrganizationModal] = React.useState(false);
  const [showLoginCommandModal, setShowLoginCommandModal] = React.useState(false);

  return (
    <>
      <Panel className="fctl-subnav_panel" id="fctl-cmd-panel">
        <PanelMain>
          <PanelMainBody>
            <Toolbar isFullHeight isStatic className="fctl-subnav_toolbar">
              <ToolbarContent>
                {currentOrganization && (
                  <ToolbarItem>
                    <OrganizationDisplay
                      organization={currentOrganization}
                      hasSingleOrg={availableOrganizations.length === 1}
                      onSwitchOrganization={() => {
                        setShowOrganizationModal(true);
                      }}
                    />
                  </ToolbarItem>
                )}
                <ToolbarItem>
                  <Button
                    variant="link"
                    aria-label={t('Copy login command')}
                    onClick={() => setShowLoginCommandModal(true)}
                  >
                    {t('Copy login command')}
                  </Button>
                </ToolbarItem>
                <ToolbarItem>
                  <SettingsDropdown />
                </ToolbarItem>
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
              const targetPath = getRedirectPathAfterOrgSwitch(location.pathname, router.appRoutes);
              window.location.href = targetPath;
            }
          }}
        />
      )}

      {showLoginCommandModal && (
        <LoginCommandModal
          onClose={() => {
            setShowLoginCommandModal(false);
          }}
        />
      )}
    </>
  );
};

export default PageNavigation;
