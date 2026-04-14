import * as React from 'react';
import {
  Brand,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  SkipToContent,
} from '@patternfly/react-core';

import { Outlet } from 'react-router-dom';
import OrganizationGuard, {
  useOrganizationGuardContext,
} from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import OrganizationSelector from '@flightctl/ui-components/src/components/common/OrganizationSelector';
import PageNavigation from '@flightctl/ui-components/src/components/common/PageNavigation';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';
import { PermissionsContextProvider } from '@flightctl/ui-components/src/components/common/PermissionsContext';
import { useBrandLogo } from '../../hooks/useBrandLogo';

import AppNavigation from './AppNavigation';
import AppToolbar from './AppToolbar';

const AppLayoutContent = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { mustShowOrganizationSelector } = useOrganizationGuardContext();
  const { logo, altText } = useBrandLogo();

  const onSidebarToggle = () => {
    setIsSidebarOpen((prevIsOpen) => !prevIsOpen);
  };

  const Header = (
    <Masthead id="stack-inline-masthead">
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton
            isHamburgerButton
            variant="plain"
            aria-label={t('Global navigation')}
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={onSidebarToggle}
            id="page-toggle-button"
            data-testid="nav-toggle"
          />
        </MastheadToggle>
        <MastheadBrand>
          <MastheadLogo>
            <Brand src={logo} alt={altText} heights={{ default: '50px' }} />
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <AppToolbar />
      </MastheadContent>
    </Masthead>
  );

  const Sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody
        style={{
          opacity: mustShowOrganizationSelector ? 0.3 : 1,
          pointerEvents: mustShowOrganizationSelector ? 'none' : 'auto',
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <AppNavigation />
      </PageSidebarBody>
    </PageSidebar>
  );

  const pageId = 'primary-app-container';

  const PageSkipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        const primaryContentContainer = document.getElementById(pageId);
        if (primaryContentContainer) {
          primaryContentContainer.focus();
        }
      }}
      href={`#${pageId}`}
    >
      {t('Skip to Content')}
    </SkipToContent>
  );
  return (
    <Page
      mainContainerId={pageId}
      masthead={Header}
      sidebar={Sidebar}
      isManagedSidebar
      skipToContent={PageSkipToContent}
    >
      {mustShowOrganizationSelector ? (
        <OrganizationSelector isFirstLogin />
      ) : (
        <>
          <PageNavigation />
          <Outlet />
        </>
      )}
    </Page>
  );
};

const AppLayout = () => {
  return (
    <OrganizationGuard>
      <PermissionsContextProvider>
        <SystemRestoreProvider>
          <AppLayoutContent />
        </SystemRestoreProvider>
      </PermissionsContextProvider>
    </OrganizationGuard>
  );
};

export default AppLayout;
