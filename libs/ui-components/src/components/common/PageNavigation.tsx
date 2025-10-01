import * as React from 'react';
import {
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
import { useTranslation } from '../../hooks/useTranslation';
import { useOrganizationGuardContext } from './OrganizationGuard';
import OrganizationSelector from './OrganizationSelector';

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
  const { currentOrganization, availableOrganizations } = useOrganizationGuardContext();
  const [showOrganizationModal, setShowOrganizationModal] = React.useState(false);

  const showOrganizationSelection = availableOrganizations.length > 1;
  if (!showOrganizationSelection) {
    return null;
  }

  const currentOrgDisplayName = currentOrganization?.spec?.displayName || currentOrganization?.metadata?.name || '';

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
