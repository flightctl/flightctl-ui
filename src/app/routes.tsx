import * as React from 'react';
import { PropsWithChildren } from 'react';

import { Navigate, RouteObject, RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom';
import AppLayout from '@app/components/AppLayout/AppLayout';
import { Overview } from '@app/old/Overview/Overview';
import { Experimental } from '@app/old/Experimental/Experimental';
import { Experimental2 } from '@app/old/Experimental/Experimental2';
import { Experimental3 } from '@app/old/Experimental/Experimental3';
import { Fleet } from '@app/old/Fleet/Fleet';
import { EnrollmentRequests } from '@app/old/EnrollmentRequests/EnrollmentRequests';
import { Devices } from '@app/old/Devices/Devices';
import { Enroll } from '@app/old/Enroll/Enroll';
import { Device } from '@app/old/Device/Device';
import { RemoteControl } from '@app/old/Device/rc';
import { GitRepositories } from '@app/old/GitRepositories/GitRepositories';
import { Organization } from '@app/old/Organization/Organization';
import { ImageBuilder } from '@app/old/ImageBuilder/ImageBuilder';
import { Workload } from '@app/old/Workload/Workload';
import { useDocumentTitle } from '@app/old/utils/useDocumentTitle';
import { NotFound } from '@app/old/NotFound/NotFound';

import CreateFleet from '@app/components/Fleet/CreateFleet/CreateFleet';
import FleetList from '@app/components/Fleet/FleetList';
import FleetDetails from '@app/components/Fleet/FleetDetails';

import { APP_TITLE } from '@app/constants';

export type ExtendedRouteObject = RouteObject & {
  title: string;
  showInNav?: boolean;
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

const experimentalRoutes = [
  {
    path: '/experimental',
    title: 'Experimental',
    element: (
      <TitledRoute title="Experimental">
        <Experimental />
      </TitledRoute>
    ),
  },
  {
    path: '/experimental2',
    title: 'Experimental2',
    element: (
      <TitledRoute title="Experimental2">
        <Experimental2 />
      </TitledRoute>
    ),
  },
  {
    path: '/experimental3',
    title: 'Experimental3',
    element: (
      <TitledRoute title="Experimental3">
        <Experimental3 />
      </TitledRoute>
    ),
  },
];

const fleetRoutes = [
  {
    path: '/devicemanagement/fleets',
    title: 'Fleets',
    children: [
      {
        index: true,
        path: '/devicemanagement/fleets',
        title: 'Fleets',
        element: (
          <TitledRoute title="Fleets">
            <FleetList />
          </TitledRoute>
        ),
      },
      {
        path: '/devicemanagement/fleets/create',
        title: 'Create Fleet',
        element: (
          <TitledRoute title="Create Fleet">
            <CreateFleet />
          </TitledRoute>
        ),
      },
      {
        path: '/devicemanagement/fleets/:fleetId',
        title: 'Fleet Details',
        element: (
          <TitledRoute title="Fleet Details">
            <FleetDetails />
          </TitledRoute>
        ),
      },
      {
        path: '/devicemanagement/fleets/old-fleet',
        title: 'Fleet (Old)',
        element: (
          <TitledRoute title="Fleet (Old)">
            <Fleet />
          </TitledRoute>
        ),
      },
    ],
  },
];
const secondaryRoutes = [
  {
    path: '/devicemanagement/enroll',
    title: 'Enroll',
    showInNav: false,
    element: (
      <TitledRoute title="Enroll">
        <Enroll />
      </TitledRoute>
    ),
  },
  {
    path: '/devicemanagement/device',
    title: 'Device',
    showInNav: false,
    element: (
      <TitledRoute title="Device">
        <Device />
      </TitledRoute>
    ),
  },
  {
    path: '/devicemanagement/rc',
    title: 'Remote Control',
    showInNav: false,
    element: (
      <TitledRoute title="Remote Control">
        <RemoteControl />
      </TitledRoute>
    ),
  },
];

const deviceManagementRoutes = [
  {
    path: '/',
    showInNav: false,
    element: <Navigate to="/devicemanagement/overview" replace />,
  },
  {
    path: '/devicemanagement/overview',
    title: 'Overview',
    element: (
      <TitledRoute title="Overview">
        <Overview />
      </TitledRoute>
    ),
  },
  ...experimentalRoutes,
  {
    path: '/devicemanagement/enrollmentrequests',
    title: 'Enrollment Requests',
    element: (
      <TitledRoute title="Enrollment Requests">
        <EnrollmentRequests />
      </TitledRoute>
    ),
  },
  ...fleetRoutes,
  {
    path: '/devicemanagement/devices',
    title: 'Devices',
    element: (
      <TitledRoute title="Devices">
        <Devices />
      </TitledRoute>
    ),
  },
  ...secondaryRoutes,
] as ExtendedRouteObject[];

const workloadRoutes = [
  {
    path: '/workload',
    title: 'Workload',
    element: (
      <TitledRoute title="Workload">
        <Workload />
      </TitledRoute>
    ),
  },
] as ExtendedRouteObject[];

const administrationRoutes = [
  {
    path: '/administration/gitrepositories',
    title: 'Git Repositories',
    element: (
      <TitledRoute title="Git Repositories">
        <GitRepositories />
      </TitledRoute>
    ),
  },
  {
    path: '/administration/organization',
    title: 'Organization',
    element: (
      <TitledRoute title="Organization">
        <Organization />
      </TitledRoute>
    ),
  },
  {
    path: '/administration/imagebuilder',
    title: 'Image Builder',
    element: (
      <TitledRoute title="Image Builder">
        <ImageBuilder />
      </TitledRoute>
    ),
  },
] as ExtendedRouteObject[];

const routes = [...deviceManagementRoutes, ...workloadRoutes, ...administrationRoutes];

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: routes,
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;

type AppRouteSections = 'Device Management' | 'Workload' | 'Administration';

const appRouteSections: Record<AppRouteSections, ExtendedRouteObject[]> = {
  'Device Management': deviceManagementRoutes,
  Workload: workloadRoutes,
  Administration: administrationRoutes,
};

export { AppRoutes, appRouteSections };
