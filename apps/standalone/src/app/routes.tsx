import * as React from 'react';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Navigate, RouteObject, RouterProvider, createBrowserRouter, useParams, useRouteError } from 'react-router-dom';
import { TFunction } from 'i18next';
import { PathMissingIcon } from '@patternfly/react-icons/dist/js/icons/path-missing-icon';

import { useDocumentTitle } from '@flightctl/ui-components/src/hooks/useDocumentTitle';
import { APP_TITLE } from '@flightctl/ui-components/src/constants';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import ErrorBoundary from '@flightctl/ui-components/src/components/common/ErrorBoundary';

import AppLayout from './components/AppLayout/AppLayout';
import NotFound from './components/AppLayout/NotFound';
import LoginPage from './components/Login/LoginPage';
import { AuthContext } from './context/AuthContext';

const EnrollmentRequestDetails = React.lazy(
  () =>
    import(
      '@flightctl/ui-components/src/components/EnrollmentRequest/EnrollmentRequestDetails/EnrollmentRequestDetails'
    ),
);
const DevicesPage = React.lazy(() => import('@flightctl/ui-components/src/components/Device/DevicesPage/DevicesPage'));
const DeviceDetails = React.lazy(
  () => import('@flightctl/ui-components/src/components/Device/DeviceDetails/DeviceDetailsPage'),
);
const EditDeviceWizard = React.lazy(
  () => import('@flightctl/ui-components/src/components/Device/EditDeviceWizard/EditDeviceWizard'),
);
const CreateRepository = React.lazy(
  () => import('@flightctl/ui-components/src/components/Repository/CreateRepository/CreateRepository'),
);
const RepositoryList = React.lazy(() => import('@flightctl/ui-components/src/components/Repository/RepositoryList'));
const RepositoryDetails = React.lazy(
  () => import('@flightctl/ui-components/src/components/Repository/RepositoryDetails/RepositoryDetails'),
);
const ResourceSyncToRepository = React.lazy(
  () => import('@flightctl/ui-components/src/components/ResourceSync/ResourceSyncToRepository'),
);

const ImportFleetWizard = React.lazy(
  () => import('@flightctl/ui-components/src/components/Fleet/ImportFleetWizard/ImportFleetWizard'),
);
const CreateFleetWizard = React.lazy(
  () => import('@flightctl/ui-components/src/components/Fleet/CreateFleet/CreateFleetWizard'),
);

const FleetsPage = React.lazy(() => import('@flightctl/ui-components/src/components/Fleet/FleetsPage'));
const FleetDetails = React.lazy(
  () => import('@flightctl/ui-components/src/components/Fleet/FleetDetails/FleetDetailsPage'),
);

const OverviewPage = React.lazy(() => import('@flightctl/ui-components/src/components/OverviewPage/OverviewPage'));
const PendingEnrollmentRequestsBadge = React.lazy(
  () => import('@flightctl/ui-components/src/components/EnrollmentRequest/PendingEnrollmentRequestsBadge'),
);
const CommandLineToolsPage = React.lazy(
  () => import('@flightctl/ui-components/src/components/Masthead/CommandLineToolsPage'),
);
const AuthProvidersPage = React.lazy(
  () => import('@flightctl/ui-components/src/components/AuthProvider/AuthProvidersPage'),
);
const CreateAuthProvider = React.lazy(
  () => import('@flightctl/ui-components/src/components/AuthProvider/CreateAuthProvider/CreateAuthProvider'),
);
const AuthProviderDetails = React.lazy(
  () => import('@flightctl/ui-components/src/components/AuthProvider/AuthProviderDetails/AuthProviderDetails'),
);
const ImageBuildsPage = React.lazy(() => import('@flightctl/ui-components/src/components/ImageBuilds/ImageBuildsPage'));
const ImageBuildDetails = React.lazy(
  () => import('@flightctl/ui-components/src/components/ImageBuilds/ImageBuildDetails/ImageBuildDetailsPage'),
);
const CreateImageBuildWizard = React.lazy(
  () => import('@flightctl/ui-components/src/components/ImageBuilds/CreateImageBuildWizard/CreateImageBuildWizard'),
);

const CatalogPage = React.lazy(() => import('@flightctl/ui-components/src/components/Catalog/CatalogPage'));
const CatalogInstallWizard = React.lazy(
  () => import('@flightctl/ui-components/src/components/Catalog/InstallWizard/InstallWizard'),
);

export type ExtendedRouteObject = RouteObject & {
  title?: string;
  showInNav?: boolean;
  children?: ExtendedRouteObject[];
  navContent?: React.ReactNode;
};

const ErrorPage = () => {
  const { t } = useTranslation();
  const error = useRouteError() as { status: number };

  if (error.status === 404) {
    return (
      <TitledRoute title={t('404 Page Not Found')}>
        <NotFound />
      </TitledRoute>
    );
  }

  return <div>{t('Error page - details should be displayed here')}</div>;
};

const TitledRoute = ({ title, children }: React.PropsWithChildren<{ title: string }>) => {
  useDocumentTitle(`${APP_TITLE} | ${title}`);
  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </React.Suspense>
  );
};

const RedirectToDeviceDetails = () => {
  const { deviceId } = useParams() as { deviceId: string };
  return <Navigate to={`/devicemanagement/devices/${deviceId}`} replace />;
};

const RedirectToEnrollmentDetails = () => {
  const { enrollmentRequestId } = useParams() as { enrollmentRequestId: string };
  return <Navigate to={`/devicemanagement/enrollmentrequests/${enrollmentRequestId}`} replace />;
};

const getAppRoutes = (t: TFunction): ExtendedRouteObject[] => [
  {
    path: '/',
    element: <Navigate to="/overview" replace />,
  },
  {
    path: '/callback',
    element: <Navigate to="/overview" replace />,
  },
  {
    path: '/overview',
    title: t('Overview'),
    showInNav: true,
    element: (
      <TitledRoute title={t('Overview')}>
        <OverviewPage />
      </TitledRoute>
    ),
  },
  {
    path: '/catalog',
    title: t('Catalog'),
    showInNav: true,
    children: [
      {
        index: true,
        title: t('Catalog'),
        element: (
          <TitledRoute title={t('Catalog')}>
            <CatalogPage />
          </TitledRoute>
        ),
      },
      {
        path: 'install/:catalogId/:itemId',
        title: t('Install Catalog item'),
        element: (
          <TitledRoute title={t('Install Catalog item')}>
            <CatalogInstallWizard />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    // Route is only exposed for the standalone app
    path: '/command-line-tools',
    title: t('Command line tools'),
    element: (
      <TitledRoute title={t('Command line tools')}>
        <CommandLineToolsPage />
      </TitledRoute>
    ),
  },
  {
    path: '/devicemanagement/enrollmentrequests/:enrollmentRequestId',
    title: t('Enrollment Request Details'),
    element: (
      <TitledRoute title={t('Enrollment Request Details')}>
        <EnrollmentRequestDetails />
      </TitledRoute>
    ),
  },
  {
    path: '/enroll/:enrollmentRequestId',
    title: t('Enrollment Request'),
    element: <RedirectToEnrollmentDetails />,
  },
  {
    path: '/devicemanagement/fleets',
    title: t('Fleets'),
    showInNav: true,
    children: [
      {
        index: true,
        title: t('Fleets'),
        element: (
          <TitledRoute title={t('Fleets')}>
            <FleetsPage />
          </TitledRoute>
        ),
      },
      {
        path: 'create',
        title: t('Create Fleet'),
        element: (
          <TitledRoute title={t('Create Fleet')}>
            <CreateFleetWizard />
          </TitledRoute>
        ),
      },
      {
        path: 'import',
        title: t('Import Fleet'),
        element: (
          <TitledRoute title={t('Import Fleet')}>
            <ImportFleetWizard />
          </TitledRoute>
        ),
      },
      {
        path: 'edit/:fleetId',
        title: t('Edit Fleet'),
        element: (
          <TitledRoute title={t('Edit Fleet')}>
            <CreateFleetWizard />
          </TitledRoute>
        ),
      },
      {
        path: ':fleetId/*',
        title: t('Fleet Details'),
        element: (
          <TitledRoute title={t('Fleet Details')}>
            <FleetDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/manage/:deviceId',
    title: t('Device'),
    element: <RedirectToDeviceDetails />,
  },
  {
    path: '/devicemanagement/devices',
    title: t('Devices'),
    showInNav: true,
    navContent: <PendingEnrollmentRequestsBadge />,
    children: [
      {
        index: true,
        title: t('Devices'),
        element: (
          <TitledRoute title={t('Devices')}>
            <DevicesPage />
          </TitledRoute>
        ),
      },
      {
        path: ':deviceId/*',
        title: t('Device'),
        element: (
          <TitledRoute title={t('Device')}>
            <DeviceDetails />
          </TitledRoute>
        ),
      },
      {
        path: 'edit/:deviceId',
        title: t('Edit device'),
        element: (
          <TitledRoute title={t('Edit device')}>
            <EditDeviceWizard />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/devicemanagement/imagebuilds',
    showInNav: true,
    title: t('Image builds'),
    children: [
      {
        index: true,
        title: t('Image builds'),
        element: (
          <TitledRoute title={t('Image builds')}>
            <ImageBuildsPage />
          </TitledRoute>
        ),
      },
      {
        path: 'create',
        title: t('Build new image'),
        element: (
          <TitledRoute title={t('Build new image')}>
            <CreateImageBuildWizard />
          </TitledRoute>
        ),
      },
      {
        path: 'edit/:imageBuildId',
        title: t('Duplicate image build'),
        element: (
          <TitledRoute title={t('Duplicate image build')}>
            <CreateImageBuildWizard />
          </TitledRoute>
        ),
      },
      {
        path: ':imageBuildId/*',
        title: t('Image build'),
        element: (
          <TitledRoute title={t('Image build')}>
            <ImageBuildDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/devicemanagement/repositories',
    showInNav: true,
    title: t('Repositories'),
    children: [
      {
        index: true,
        title: t('Repositories'),
        element: (
          <TitledRoute title={t('Repositories')}>
            <RepositoryList />
          </TitledRoute>
        ),
      },
      {
        path: 'create',
        title: t('Create Repository'),
        element: (
          <TitledRoute title={t('Create Repository')}>
            <CreateRepository />
          </TitledRoute>
        ),
      },
      {
        path: 'edit/:repositoryId',
        title: t('Edit repository'),
        element: (
          <TitledRoute title={t('Edit repository')}>
            <CreateRepository />
          </TitledRoute>
        ),
      },
      {
        path: ':repositoryId/*',
        title: t('Repository Details'),
        element: (
          <TitledRoute title={t('Repository Details')}>
            <RepositoryDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/devicemanagement/resourcesyncs/:rsId',
    title: t('Resource sync'),
    // Fetches the RS from its ID and redirects to the repository page
    element: (
      <TitledRoute title={t('Resource sync')}>
        <ResourceSyncToRepository />
      </TitledRoute>
    ),
  },
  {
    path: '/admin/authproviders',
    title: t('Authentication Providers'),
    element: (
      <TitledRoute title={t('Authentication Providers')}>
        <AuthProvidersPage />
      </TitledRoute>
    ),
  },
  {
    path: '/admin/authproviders/create',
    title: t('Create Authentication Provider'),
    element: (
      <TitledRoute title={t('Create Authentication Provider')}>
        <CreateAuthProvider />
      </TitledRoute>
    ),
  },
  {
    path: '/admin/authproviders/edit/:authProviderId',
    title: t('Edit Authentication Provider'),
    element: (
      <TitledRoute title={t('Edit Authentication Provider')}>
        <CreateAuthProvider />
      </TitledRoute>
    ),
  },
  {
    path: '/admin/authproviders/:authProviderId/*',
    title: t('Authentication Provider Details'),
    element: (
      <TitledRoute title={t('Authentication Provider Details')}>
        <AuthProviderDetails />
      </TitledRoute>
    ),
  },
];

const AppRouter = () => {
  const { t } = useTranslation();

  const { username, loading, error } = React.useContext(AuthContext);

  if (error) {
    return (
      <EmptyState
        headingLevel="h2"
        icon={PathMissingIcon}
        titleText={t('Log in interrupted')}
        variant={EmptyStateVariant.xl}
        style={{ marginTop: '20%' }}
      >
        <EmptyStateBody>
          <Stack>
            <StackItem style={{ margin: 'auto' }}>
              {t("Your log in didn't fully complete. Try again to continue.")}
            </StackItem>
          </Stack>
        </EmptyStateBody>
        <EmptyStateFooter>
          <Button variant="link" onClick={() => window.location.replace('/')}>
            {t('Try again')}
          </Button>
        </EmptyStateFooter>
      </EmptyState>
    );
  }

  if (loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  // Check if user needs to authenticate
  const isAuthenticated = !!username;
  const isLoginPage = window.location.pathname === '/login';
  const isCallbackPage = window.location.pathname === '/callback';

  // Redirect to login if not authenticated and not already on login/callback page
  if (!isAuthenticated && !isLoginPage && !isCallbackPage) {
    window.location.href = '/login';
    return null;
  }

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/callback',
      element: <Navigate to="/" replace />,
    },
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: getAppRoutes(t),
    },
  ]);

  return <RouterProvider router={router} />;
};

export { AppRouter, getAppRoutes };
