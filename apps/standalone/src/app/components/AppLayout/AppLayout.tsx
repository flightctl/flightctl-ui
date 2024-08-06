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

import logo from '@fctl-assets/bgimages/flightctl-logo.svg';
import AppNavigation from './AppNavigation';
import AppToolbar from './AppToolbar';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';

const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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
          <Brand src={logo} alt="Device management service Logo" heights={{ default: '30px' }} />
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <AppToolbar />
      </MastheadContent>
    </Masthead>
  );

  const Sidebar = (
    <PageSidebar theme="dark" isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
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
      <Outlet />
    </Page>
  );
};

export default AppLayout;
