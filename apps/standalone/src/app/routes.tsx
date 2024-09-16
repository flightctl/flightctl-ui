import * as React from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Navigate, RouteObject, RouterProvider, createBrowserRouter, useParams, useRouteError } from 'react-router-dom';
import { TFunction } from 'i18next';

import { useDocumentTitle } from '@flightctl/ui-components/src/hooks/useDocumentTitle';
import { APP_TITLE } from '@flightctl/ui-components/src/constants';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';

import AppLayout from './components/AppLayout/AppLayout';
import NotFound from './components/AppLayout/NotFound';
import ErrorBoundary from '@flightctl/ui-components/src/components/common/ErrorBoundary';

const EnrollmentRequestDetails = React.lazy(
  () =>
    import(
      '@flightctl/ui-components/src/components/EnrollmentRequest/EnrollmentRequestDetails/EnrollmentRequestDetails'
    ),
);
const DeviceList = React.lazy(() => import('@flightctl/ui-components/src/components/Device/DeviceList/DeviceList'));
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

const FleetList = React.lazy(() => import('@flightctl/ui-components/src/components/Fleet/FleetList'));
const FleetDetails = React.lazy(
  () => import('@flightctl/ui-components/src/components/Fleet/FleetDetails/FleetDetails'),
);

const OverviewPage = React.lazy(() => import('@flightctl/ui-components/src/components/OverviewPage/OverviewPage'));

export type ExtendedRouteObject = RouteObject & {
  title?: string;
  showInNav?: boolean;
  children?: ExtendedRouteObject[];
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
            <FleetList />
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
        path: ':fleetId',
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
    children: [
      {
        index: true,
        title: t('Devices'),
        element: (
          <TitledRoute title={t('Devices')}>
            <DeviceList />
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
];

const AppRouter = () => {
  const { t } = useTranslation();
  const router = createBrowserRouter([
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
