import * as React from 'react';
import { PropsWithChildren } from 'react';

import { Navigate, RouteObject, RouterProvider, createBrowserRouter, useParams, useRouteError } from 'react-router-dom';

import AppLayout from './components/AppLayout/AppLayout';
import NotFound from './components/AppLayout/NotFound';
import CreateFleet from '@flightctl/ui-components/components/Fleet/CreateFleet/CreateFleet';
import FleetList from '@flightctl/ui-components/components/Fleet/FleetList';
import FleetDetails from '@flightctl/ui-components/components/Fleet/FleetDetails/FleetDetails';
import EnrollmentRequestDetails from '@flightctl/ui-components/components/EnrollmentRequest/EnrollmentRequestDetails/EnrollmentRequestDetails';
import DeviceList from '@flightctl/ui-components/components/Device/DeviceList';
import DeviceDetails from '@flightctl/ui-components/components/Device/DeviceDetails/DeviceDetails';
import CreateRepository from '@flightctl/ui-components/components/Repository/CreateRepository/CreateRepository';
import RepositoryList from '@flightctl/ui-components/components/Repository/RepositoryList';
import RepositoryDetails from '@flightctl/ui-components/components/Repository/RepositoryDetails/RepositoryDetails';
import ResourceSyncToRepository from '@flightctl/ui-components/components/ResourceSync/ResourceSyncToRepository';

import { useDocumentTitle } from '@flightctl/ui-components/hooks/useDocumentTitle';
import { APP_TITLE } from '@flightctl/ui-components/constants';
import ImportFleetWizard from '@flightctl/ui-components/components/Fleet/ImportFleetWizard/ImportFleetWizard';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

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

const TitledRoute = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  useDocumentTitle(`${APP_TITLE} | ${title}`);
  return children;
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
    element: <Navigate to="/devicemanagement/fleets" replace />,
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
            <CreateFleet />
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
        path: ':deviceId',
        title: t('Device'),
        element: (
          <TitledRoute title={t('Device')}>
            <DeviceDetails />
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
