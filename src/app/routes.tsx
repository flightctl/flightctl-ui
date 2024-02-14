import * as React from 'react';
import { PropsWithChildren } from 'react';

import { Navigate, RouteObject, RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom';
import AppLayout from '@app/components/AppLayout/AppLayout';
import { Overview } from '@app/old/Overview/Overview';
import { Experimental } from '@app/old/Experimental/Experimental';
import { Experimental2 } from '@app/old/Experimental/Experimental2';
import { Experimental3 } from '@app/old/Experimental/Experimental3';
import { Devices } from '@app/old/Devices/Devices';
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
import EnrollmentRequestList from './components/EnrollmentRequest/EnrollmentRequestList';
import DeviceEnrollmentPage from './components/EnrollmentRequest/DeviceEnrollmentPage';
import { UserPreferencesContext } from './components/UserPreferences/UserPreferencesProvider';

export type ExtendedRouteObject = RouteObject & {
  title?: string;
  showInNav?: boolean;
  isExperimental?: boolean;
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

const experimentalRoutes: ExtendedRouteObject[] = [
  {
    path: '/experimental',
    title: 'Experimental',
    element: (
      <TitledRoute title="Experimental">
        <Experimental />
      </TitledRoute>
    ),
    isExperimental: true,
  },
  {
    path: '/experimental2',
    title: 'Experimental2',
    element: (
      <TitledRoute title="Experimental2">
        <Experimental2 />
      </TitledRoute>
    ),
    isExperimental: true,
  },
  {
    path: '/experimental3',
    title: 'Experimental3',
    element: (
      <TitledRoute title="Experimental3">
        <Experimental3 />
      </TitledRoute>
    ),
    isExperimental: true,
  },
];

const deviceManagementRoutes = (experimentalFeatures?: boolean): ExtendedRouteObject[] => [
  {
    path: '/',
    showInNav: false,
    element: <Navigate to={experimentalFeatures ? '/devicemanagement/overview' : '/devicemanagement/fleets'} replace />,
  },
  {
    path: '/devicemanagement/overview',
    title: 'Overview',
    element: (
      <TitledRoute title="Overview">
        <Overview />
      </TitledRoute>
    ),
    isExperimental: true,
  },
  ...experimentalRoutes,
  {
    path: '/devicemanagement/enrollmentrequests',
    title: 'Enrollment Requests',
    element: (
      <TitledRoute title="Enrollment Requests">
        <EnrollmentRequestList />
      </TitledRoute>
    ),
  },
  {
    path: '/enroll/:id',
    title: 'Enrollment Request',
    showInNav: false,
    element: (
      <TitledRoute title="Enrollment Request">
        <DeviceEnrollmentPage />
      </TitledRoute>
    ),
  },
  {
    path: '/devicemanagement/fleets',
    title: 'Fleets',
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
        path: ':fleetId',
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
    path: '/devicemanagement/devices',
    title: 'Devices',
    children: [
      {
        index: true,
        title: 'Devices',
        element: (
          <TitledRoute title="Devices">
            <Devices />
          </TitledRoute>
        ),
      },
      {
        path: ':deviceID',
        title: 'Device',
        showInNav: false,
        element: (
          <TitledRoute title="Device">
            <Device />
          </TitledRoute>
        ),
      },
    ],
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

const workloadRoutes: ExtendedRouteObject[] = [
  {
    path: '/workload',
    title: 'Workload',
    element: (
      <TitledRoute title="Workload">
        <Workload />
      </TitledRoute>
    ),
  },
];

const administrationRoutes: ExtendedRouteObject[] = [
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
];

const AppRoutes = () => {
  const { experimentalFeatures } = React.useContext(UserPreferencesContext);

  const routes = [...deviceManagementRoutes(experimentalFeatures), ...workloadRoutes, ...administrationRoutes];
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: routes,
    },
  ]);

  return <RouterProvider router={router} />;
};

type AppRouteSections = 'Device Management' | 'Workload' | 'Administration';

const appRouteSections: Record<AppRouteSections, ExtendedRouteObject[]> = {
  'Device Management': deviceManagementRoutes(),
  Workload: workloadRoutes,
  Administration: administrationRoutes,
};

export { AppRoutes, appRouteSections };
