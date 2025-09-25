import * as React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
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
    >
      <DropdownList>
        <DropdownItem onClick={onSwitchOrganization}>{t('Change Organization')}</DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

const PageNavigation = ({ children }: React.PropsWithChildren) => {
  const { currentOrganization, availableOrganizations } = useOrganizationGuardContext();
  const [showOrganizationModal, setShowOrganizationModal] = React.useState(false);

  const showOrganizationSelection = availableOrganizations.length > 1;
  const hasChildren = React.Children.count(children) > 0;

  if (!showOrganizationSelection && !hasChildren) {
    return null;
  }

  const currentOrgDisplayName = currentOrganization?.spec?.displayName || currentOrganization?.metadata?.name || '';

  return (
    <>
      <PageSection variant="light" padding={{ default: 'noPadding' }}>
        <Toolbar isFullHeight isStatic className="fctl-app_toolbar">
          <ToolbarContent>
            {hasChildren && <ToolbarItem>{children}</ToolbarItem>}
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
