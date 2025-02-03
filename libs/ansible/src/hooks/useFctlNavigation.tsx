import * as React from 'react';
import { ROUTE } from '@flightctl/ui-components/src/hooks/useNavigate';

import { appRoutes } from '../const';
import ScrollablePage from '../components/ScrollablePage/ScrollablePage';

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
  () => import('@flightctl/ui-components/src/components/Fleet/FleetDetails/FleetDetails'),
);

const OverviewPage = React.lazy(() => import('@flightctl/ui-components/src/components/OverviewPage/OverviewPage'));

const getNavRoute = (route: string) => route.replace('/edge/', '');

export const useFctlNavigation = () => {
  const navigationItems = React.useMemo(
    () => [
      {
        id: 'overview',
        label: 'Overview',
        path: getNavRoute(appRoutes[ROUTE.ROOT]),
        element: (
          <ScrollablePage>
            <OverviewPage />
          </ScrollablePage>
        ),
      },
      {
        id: 'fleets',
        label: 'Fleets',
        path: 'fleets',
        children: [
          {
            path: '',
            element: (
              <ScrollablePage>
                <FleetsPage />
              </ScrollablePage>
            ),
          },
          {
            id: 'fleet-details',
            path: ':fleetId',
            element: (
              <ScrollablePage>
                <FleetDetails />
              </ScrollablePage>
            ),
          },
          {
            id: 'create',
            path: 'create',
            element: (
              <ScrollablePage>
                <CreateFleetWizard />
              </ScrollablePage>
            ),
          },
          {
            id: 'import',
            path: 'import',
            element: (
              <ScrollablePage>
                <ImportFleetWizard />
              </ScrollablePage>
            ),
          },
          {
            id: 'edit',
            path: 'edit/:fleetId',
            element: (
              <ScrollablePage>
                <CreateFleetWizard />
              </ScrollablePage>
            ),
          },
        ],
      },
      {
        id: 'devices',
        label: 'Devices',
        path: getNavRoute(appRoutes[ROUTE.DEVICES]),
        children: [
          {
            path: '',
            element: (
              <ScrollablePage>
                <DevicesPage />
              </ScrollablePage>
            ),
          },
          {
            id: 'details',
            path: ':deviceId/*',
            element: (
              <ScrollablePage>
                <DeviceDetails />
              </ScrollablePage>
            ),
          },
          {
            id: 'edit',
            path: 'edit/:deviceId',
            element: (
              <ScrollablePage>
                <EditDeviceWizard />
              </ScrollablePage>
            ),
          },
        ],
      },
      {
        id: 'repositories',
        label: 'Repositories',
        path: getNavRoute(appRoutes[ROUTE.REPOSITORIES]),
        children: [
          {
            path: '',
            element: (
              <ScrollablePage>
                <RepositoryList />
              </ScrollablePage>
            ),
          },
          {
            id: 'create',
            path: 'create',
            element: (
              <ScrollablePage>
                <CreateRepository />
              </ScrollablePage>
            ),
          },
          {
            id: 'edit',
            path: 'edit/:repositoryId',
            element: (
              <ScrollablePage>
                <CreateRepository />
              </ScrollablePage>
            ),
          },
          {
            id: 'details',
            path: ':repositoryId/*',
            element: (
              <ScrollablePage>
                <RepositoryDetails />
              </ScrollablePage>
            ),
          },
        ],
      },
      {
        path: 'resourcesyncs/:rsId',
        // Fetches the RS from its ID and redirects to the repository page
        element: (
          <ScrollablePage>
            <ResourceSyncToRepository />
          </ScrollablePage>
        ),
      },
      {
        path: 'enrollmentrequests/:enrollmentRequestId',
        element: (
          <ScrollablePage>
            <EnrollmentRequestDetails />
          </ScrollablePage>
        ),
      },
    ],
    [],
  );
  return navigationItems;
};
