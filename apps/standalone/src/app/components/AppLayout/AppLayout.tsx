import * as React from 'react';
import {
  Brand,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  SkipToContent,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons/dist/js/icons/bars-icon';
import { Outlet } from 'react-router-dom';
import OrganizationGuard, {
  useOrganizationGuardContext,
} from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import OrganizationSelector from '@flightctl/ui-components/src/components/common/OrganizationSelector';
import PageNavigation from '@flightctl/ui-components/src/components/common/PageNavigation';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';

import logo from '@fctl-assets/bgimages/flight-control-logo.svg';
import rhemLogo from '@fctl-assets/bgimages/RHEM-logo.svg';
import AppNavigation from './AppNavigation';
import AppToolbar from './AppToolbar';

const AppLayoutContent = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const { isOrganizationSelectionRequired } = useOrganizationGuardContext();

  const onSidebarToggle = () => {
    setIsSidebarOpen((prevIsOpen) => !prevIsOpen);
  };

  const Header = (
    <Masthead id="stack-inline-masthead">
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton
            variant="plain"
            aria-label={t('Global navigation')}
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={onSidebarToggle}
            id="page-toggle-button"
          >
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadBrand>
          {window.isRHEM ? (
            <Brand src={rhemLogo} alt="Red Hat Edge Manager logo" heights={{ default: '50px' }} />
          ) : (
            <Brand src={logo} alt="Flight Control Logo" heights={{ default: '30px' }} />
          )}
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <AppToolbar />
      </MastheadContent>
    </Masthead>
  );

  const Sidebar = (
    <PageSidebar theme="dark" isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody
        style={{
          opacity: isOrganizationSelectionRequired ? 0.3 : 1,
          pointerEvents: isOrganizationSelectionRequired ? 'none' : 'auto',
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
        primaryContentContainer && primaryContentContainer.focus();
      }}
      href={`#${pageId}`}
    >
      {t('Skip to Content')}
    </SkipToContent>
  );
  return (
    <Page mainContainerId={pageId} header={Header} sidebar={Sidebar} isManagedSidebar skipToContent={PageSkipToContent}>
      {isOrganizationSelectionRequired ? (
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
      <AppLayoutContent />
    </OrganizationGuard>
  );
};

export default AppLayout;
