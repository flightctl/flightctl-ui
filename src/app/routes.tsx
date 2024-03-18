import * as React from 'react';
import { PropsWithChildren, useEffect } from 'react';

import {
  Navigate,
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
  useParams,
  useRouteError,
} from 'react-router-dom';

import AppLayout from '@app/components/AppLayout/AppLayout';
import NotFound from '@app/components/AppLayout/NotFound';
import CreateFleet from '@app/components/Fleet/CreateFleet/CreateFleet';
import FleetList from '@app/components/Fleet/FleetList';
import FleetDetails from '@app/components/Fleet/FleetDetails/FleetDetails';
import EnrollmentRequestDetails from '@app/components/EnrollmentRequest/EnrollmentRequestDetails/EnrollmentRequestDetails';
import DeviceList from '@app/components/Device/DeviceList';
import DeviceDetails from '@app/components/Device/DeviceDetails/DeviceDetails';
import CreateRepository from '@app/components/Repository/CreateRepository/CreateRepository';
import RepositoryList from '@app/components/Repository/RepositoryList';
import RepositoryDetails from '@app/components/Repository/RepositoryDetails/RepositoryDetails';
import ResourceSyncToRepository from '@app/components/ResourceSync/ResourceSyncToRepository';

import { useDocumentTitle } from '@app/hooks/useDocumentTitle';
import { APP_TITLE } from '@app/constants';

export type ExtendedRouteObject = RouteObject & {
  title?: string;
  showInNav?: boolean;
  children?: ExtendedRouteObject[];
};

const ErrorPage = () => {
  const error = useRouteError() as { status: number };

  if (error.status === 404) {
    return (
      <TitledRoute title="404 Page Not Found">
        <NotFound />
      </TitledRoute>
    );
  }

  return <div>Error page - details should be displayed here</div>;
};

const TitledRoute = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  useDocumentTitle(`${APP_TITLE} | ${title}`);
  return children;
};

const Refresh = () => {
  const navigate = useNavigate();
  useEffect(() => navigate(-1), [navigate]);
  return <></>;
};

const RedirectToDeviceDetails = () => {
  const { deviceId } = useParams() as { deviceId: string };
  return <Navigate to={`/devicemanagement/devices/${deviceId}`} replace />;
};

const RedirectToEnrollmentDetails = () => {
  const { enrollmentRequestId } = useParams() as { enrollmentRequestId: string };
  return <Navigate to={`/devicemanagement/enrollmentrequests/${enrollmentRequestId}`} replace />;
};

const appRoutes: ExtendedRouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/devicemanagement/fleets" replace />,
  },
  {
    path: '/devicemanagement/enrollmentrequests/:enrollmentRequestId',
    title: 'Enrollment Request Details',
    element: (
      <TitledRoute title="Enrollment Request Details">
        <EnrollmentRequestDetails />
      </TitledRoute>
    ),
  },
  {
    path: '/enroll/:enrollmentRequestId',
    title: 'Enrollment Request',
    element: <RedirectToEnrollmentDetails />,
  },
  {
    path: '/devicemanagement/fleets',
    title: 'Fleets',
    showInNav: true,
    children: [
      {
        index: true,
        title: 'Fleets',
        element: (
          <TitledRoute title="Fleets">
            <FleetList />
          </TitledRoute>
        ),
      },
      {
        path: 'create',
        title: 'Create Fleet',
        element: (
          <TitledRoute title="Create Fleet">
            <CreateFleet />
          </TitledRoute>
        ),
      },
      {
        path: ':fleetId/*',
        title: 'Fleet Details',
        element: (
          <TitledRoute title="Fleet Details">
            <FleetDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/manage/:deviceId',
    title: 'Device',
    element: <RedirectToDeviceDetails />,
  },
  {
    path: '/devicemanagement/devices',
    title: 'Devices',
    showInNav: true,
    children: [
      {
        index: true,
        title: 'Devices',
        element: (
          <TitledRoute title="Devices">
            <DeviceList />
          </TitledRoute>
        ),
      },
      {
        path: ':deviceId',
        title: 'Device',
        element: (
          <TitledRoute title="Device">
            <DeviceDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/devicemanagement/repositories',
    showInNav: true,
    title: 'Repositories',
    children: [
      {
        index: true,
        title: 'Repositories',
        element: (
          <TitledRoute title="Repositories">
            <RepositoryList />
          </TitledRoute>
        ),
      },
      {
        path: 'create',
        title: 'Create Repository',
        element: (
          <TitledRoute title="Create Repository">
            <CreateRepository />
          </TitledRoute>
        ),
      },
      {
        path: ':repositoryId/*',
        title: 'Repository Details',
        element: (
          <TitledRoute title="Repository Details">
            <RepositoryDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/devicemanagement/resourcesyncs/:rsId',
    title: 'Resource sync',
    // Fetches the RS from its ID and redirects to the repository page
    element: (
      <TitledRoute title="Resource sync">
        <ResourceSyncToRepository />
      </TitledRoute>
    ),
  },
  {
    path: '/refresh',
    element: <Refresh />,
  },
];

const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: appRoutes,
    },
  ]);

  return <RouterProvider router={router} />;
};

export { AppRouter, appRoutes };
