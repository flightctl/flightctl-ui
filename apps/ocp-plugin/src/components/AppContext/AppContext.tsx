import * as React from 'react';
import { AppContext, AppContextProps, FlightCtlApp, NavLinkFC } from '@flightctl/ui-components/src/hooks/useAppContext';
import { ROUTE } from '@flightctl/ui-components/src/hooks/useNavigate';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom-v5-compat';
import { getUser } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers';
import { useSelector } from 'react-redux';
import { useFetch } from '../../hooks/useFetch';

import './AppContext.css';

/**
 * OCP Plugin App Context Provider
 * The OCP plugin system calls useValuesAppContext separately and passes the value as a prop
 */
export const OCPPluginAppContext: React.FC<React.PropsWithChildren<{ value: AppContextProps }>> = ({
  children,
  value,
}) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const appRoutes = {
  [ROUTE.ROOT]: '/',
  [ROUTE.FLEETS]: '/edge/fleets',
  [ROUTE.FLEET_DETAILS]: '/edge/fleets',
  [ROUTE.FLEET_CREATE]: '/edge/fleets/create',
  [ROUTE.FLEET_EDIT]: '/edge/fleets/edit',
  [ROUTE.FLEET_IMPORT]: '/edge/fleets/import',
  [ROUTE.DEVICES]: '/edge/devices',
  [ROUTE.DEVICE_DETAILS]: '/edge/devices',
  [ROUTE.DEVICE_EDIT]: '/edge/devices/edit',
  [ROUTE.REPO_CREATE]: '/edge/repositories/create',
  [ROUTE.REPO_EDIT]: '/edge/repositories/edit',
  [ROUTE.REPO_DETAILS]: '/edge/repositories',
  [ROUTE.REPOSITORIES]: '/edge/repositories',
  [ROUTE.IMAGE_BUILDS]: '/edge/imagebuilds',
  [ROUTE.IMAGE_BUILD_CREATE]: '/edge/imagebuilds/create',
  [ROUTE.IMAGE_BUILD_DETAILS]: '/edge/imagebuilds',
  [ROUTE.IMAGE_BUILD_EDIT]: '/edge/imagebuilds/edit',
  [ROUTE.RESOURCE_SYNC_DETAILS]: '/edge/resourcesyncs',
  [ROUTE.ENROLLMENT_REQUESTS]: '/edge/enrollmentrequests',
  [ROUTE.ENROLLMENT_REQUEST_DETAILS]: '/edge/enrollmentrequests',
  // Unimplemented UI routes for OCP plugin
  [ROUTE.COMMAND_LINE_TOOLS]: '/', // CLI downloads are shown embedded in OCP's CLI downloads page and not as an independent route
  [ROUTE.AUTH_PROVIDERS]: '/', // Authentication providers must be defined in the OpenShift Console, not through Flight Control
  [ROUTE.AUTH_PROVIDER_CREATE]: '/',
  [ROUTE.AUTH_PROVIDER_EDIT]: '/',
  [ROUTE.AUTH_PROVIDER_DETAILS]: '/',
};

export const useValuesAppContext = (): AppContextProps => {
  const fetch = useFetch();
  const userInfo = useSelector(getUser);

  return {
    appType: FlightCtlApp.OCP,
    settings: {},
    user: userInfo?.username || '',
    router: {
      Link,
      appRoutes,
      NavLink: NavLink as NavLinkFC,
      Routes,
      Navigate,
      Route,
      useBlocker,
      useLocation,
      useNavigate,
      useParams,
      useSearchParams,
    },
    i18n: {
      transNamespace: 'plugin__flightctl-plugin',
    },
    fetch,
  };
};
