import * as React from 'react';
import { Route, RouteComponentProps, Switch, useLocation } from 'react-router-dom';
import { Overview } from '@app/old/Overview/Overview';
import { EnrollmentRequests } from '@app/old/EnrollmentRequests/EnrollmentRequests';
import { Fleet } from '@app/old/Fleet/Fleet';
import { Devices } from '@app/old/Devices/Devices';
import { Enroll } from '@app/old/Enroll/Enroll';
import { Device } from '@app/old/Device/Device';
import { GitRepositories } from '@app/old/GitRepositories/GitRepositories';
import { Organization } from '@app/old/Organization/Organization';
import { ImageBuilder } from '@app/old/ImageBuilder/ImageBuilder';
import { NotFound } from '@app/old/NotFound/NotFound';
import { useDocumentTitle } from '@app/old/utils/useDocumentTitle';
import { RemoteControl } from '@app/old/Device/rc';
import { Workload } from '@app/old/Workload/Workload';
import { Experimental } from '@app/old/Experimental/Experimental';
import { Experimental2 } from '@app/old/Experimental/Experimental2';
import { Experimental3 } from '@app/old/Experimental/Experimental3';
import FleetList from './components/Fleet/FleetList';
import CreateFleet from './components/Fleet/CreateFleet';
let routeFocusTimer: number;
export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    label: 'Device Management',
    routes: [
      {
        component: Overview,
        exact: true,
        label: 'Overview',
        path: '/',
        title: 'FlightControl | Overview',
      },
      {
        component: Experimental,
        exact: true,
        label: 'Experimental',
        path: '/experimental',
        title: 'FlightControl | Experimental',
      },
      {
        component: Experimental2,
        exact: true,
        label: 'Experimental2',
        path: '/experimental2',
        title: 'FlightControl | Experimental2',
      },
      {
        component: Experimental3,
        exact: true,
        label: 'Experimental3',
        path: '/experimental3',
        title: 'FlightControl | Experimental3',
      },
      {
        component: EnrollmentRequests,
        exact: true,
        label: 'Enrollment Requests',
        path: '/devicemanagement/enrollmentrequests',
        title: 'FlightControl | Enrollment Requests',
      },
      {
        component: FleetList,
        exact: true,
        label: 'Fleets',
        path: '/devicemanagement/fleets',
        title: 'FlightControl | Fleets',
      },
      {
        component: CreateFleet,
        exact: true,
        path: '/devicemanagement/fleets/create',
        title: 'FlightControl | Create Fleet',
      },
      {
        component: Fleet,
        exact: false,
        path: '/fleet',
        title: 'FlightControl | Fleet',
      },
      {
        component: Devices,
        exact: true,
        label: 'Devices',
        path: '/devicemanagement/devices',
        title: 'FlightControl | Devices',
      },
      {
        component: Enroll,
        exact: false,
        path: '/enroll',
        title: 'FlightControl | Enroll',
      },
      {
        component: Device,
        exact: false,
        path: '/device',
        title: 'FlightControl | Device',
      },
      {
        component: RemoteControl,
        exact: false,
        path: '/rc',
        title: 'FlightControl | Device - Remote Control',
      },
    ],
  },
  {
    component: Workload,
    exact: true,
    label: 'Workload',
    path: '/workload',
    title: 'FlightControl | Workload',
  },
  {
    label: 'Administration',
    routes: [
      {
        component: GitRepositories,
        exact: true,
        label: 'Git Repositories',
        path: '/administration/gitrepositories',
        title: 'FlightControl | Git Repositories',
      },
      {
        component: Organization,
        exact: true,
        label: 'Organization',
        path: '/administration/organization',
        title: 'FlightControl | Organization',
      },
      {
        component: ImageBuilder,
        exact: true,
        label: 'Image Builder',
        path: '/administration/imagebuilder',
        title: 'FlightControl | Image Builder',
      },
    ],
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
// may not be necessary if https://github.com/ReactTraining/react-router/issues/5210 is resolved
const useA11yRouteChange = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    routeFocusTimer = window.setTimeout(() => {
      const mainContainer = document.getElementById('primary-app-container');
      if (mainContainer) {
        mainContainer.focus();
      }
    }, 50);
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [pathname]);
};

const RouteWithTitleUpdates = ({ component: Component, title, ...rest }: IAppRoute) => {
  useA11yRouteChange();
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} {...rest} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Switch>
    {flattenedRoutes.map(({ path, exact, component, title }, idx) => (
      <RouteWithTitleUpdates path={path} exact={exact} component={component} key={idx} title={title} />
    ))}
    <PageNotFound title="404 Page Not Found" />
  </Switch>
);

export { AppRoutes, routes };
