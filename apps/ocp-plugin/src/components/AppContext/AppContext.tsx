import * as React from 'react';
import {
  AppContext,
  AppContextProps,
  FlightCtlApp,
  NavLinkFC,
  PromptFC,
} from '@flightctl/ui-components/src/hooks/useAppContext';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';
import { ROUTE } from '@flightctl/ui-components/src/hooks/useNavigate';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom-v5-compat';
import { Prompt } from 'react-router-dom';
import { getUser } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers';
import { useSelector } from 'react-redux';
import { useFetch } from '../../hooks/useFetch';

import './AppContext.css';

/**
 * OCP Plugin App Context Provider that includes SystemRestoreProvider
 * The OCP plugin system calls useValuesAppContext separately and passes the value as a prop
 */
export const OCPPluginAppContext: React.FC<React.PropsWithChildren<{ value: AppContextProps }>> = ({
  children,
  value,
}) => {
  return (
    <AppContext.Provider value={value}>
      <SystemRestoreProvider>{children}</SystemRestoreProvider>
    </AppContext.Provider>
  );
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
  [ROUTE.RESOURCE_SYNC_DETAILS]: '/edge/resourcesyncs',
  [ROUTE.ENROLLMENT_REQUESTS]: '/edge/enrollmentrequests',
  [ROUTE.ENROLLMENT_REQUEST_DETAILS]: '/edge/enrollmentrequests',
  [ROUTE.COMMAND_LINE_TOOLS]: '/', // CLI downloads are shown embedded in OCP's CLI downloads page and not as an independent route
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
      useLocation,
      useNavigate,
      useParams,
      useSearchParams,
      Prompt: Prompt as PromptFC,
    },
    i18n: {
      transNamespace: 'plugin__flightctl-plugin',
    },
    fetch,
  };
};
