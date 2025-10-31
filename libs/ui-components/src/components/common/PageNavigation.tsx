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
  Tooltip,
} from '@patternfly/react-core';
import { useTranslation } from '../../hooks/useTranslation';
import { useOrganizationGuardContext } from './OrganizationGuard';
import OrganizationSelector from './OrganizationSelector';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import CogIcon from '@patternfly/react-icons/dist/js/icons/cog-icon';
import { useAccessReview } from '../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../types/rbac';

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

const PageNavigation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentOrganization, availableOrganizations } = useOrganizationGuardContext();
  const [isAdmin] = useAccessReview(RESOURCE.AUTH_PROVIDER, VERB.UPDATE);
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
      <PageSection variant="light" padding={{ default: 'noPadding' }}>
        <Masthead id="global-actions-masthead">
          <MastheadContent>
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
    </>
  );
};

export default PageNavigation;
