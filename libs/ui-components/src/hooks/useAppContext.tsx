import * as React from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  NavigateFunction as RouterNavigateFunction,
  Routes,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { PatchRequest } from '@flightctl/types';
import { ROUTE } from './useNavigate';

export const appRoutes = {
  [ROUTE.ROOT]: '/',
  [ROUTE.FLEETS]: '/devicemanagement/fleets',
  [ROUTE.FLEET_DETAILS]: '/devicemanagement/fleets',
  [ROUTE.FLEET_CREATE]: '/devicemanagement/fleets/create',
  [ROUTE.FLEET_EDIT]: '/devicemanagement/fleets/edit',
  [ROUTE.FLEET_IMPORT]: '/devicemanagement/fleets/import',
  [ROUTE.DEVICES]: '/devicemanagement/devices',
  [ROUTE.DEVICE_DETAILS]: '/devicemanagement/devices',
  [ROUTE.DEVICE_EDIT]: '/devicemanagement/devices/edit',
  [ROUTE.REPO_CREATE]: '/devicemanagement/repositories/create',
  [ROUTE.REPO_EDIT]: '/devicemanagement/repositories/edit',
  [ROUTE.REPO_DETAILS]: '/devicemanagement/repositories',
  [ROUTE.REPOSITORIES]: '/devicemanagement/repositories',
  [ROUTE.RESOURCE_SYNC_DETAILS]: '/devicemanagement/resourcesyncs',
  [ROUTE.ENROLLMENT_REQUESTS]: '/devicemanagement/enrollmentrequests',
  [ROUTE.ENROLLMENT_REQUEST_DETAILS]: '/devicemanagement/enrollmentrequests',
  [ROUTE.COMMAND_LINE_TOOLS]: '/command-line-tools',
  [ROUTE.AUTH_PROVIDERS]: '/admin/authproviders',
  [ROUTE.AUTH_PROVIDER_CREATE]: '/admin/authproviders/create',
  [ROUTE.AUTH_PROVIDER_EDIT]: '/admin/authproviders/edit',
  [ROUTE.AUTH_PROVIDER_DETAILS]: '/admin/authproviders',
  [ROUTE.IMAGE_BUILDS]: '/devicemanagement/imagebuilds',
  [ROUTE.IMAGE_BUILD_CREATE]: '/devicemanagement/imagebuilds/create',
  [ROUTE.IMAGE_BUILD_DETAILS]: '/devicemanagement/imagebuilds',
  [ROUTE.IMAGE_BUILD_EDIT]: '/devicemanagement/imagebuilds/edit',
};

export type NavLinkFC = React.FC<{ to: string; children: (props: { isActive: boolean }) => React.ReactNode }>;
export enum FlightCtlApp {
  STANDALONE = 'standalone',
  OCP = 'ocp',
}

export type AppContextProps = {
  appType: FlightCtlApp;
  user?: string; // auth?.user?.profile.preferred_username
  i18n: {
    transNamespace?: string;
  };
  settings: {
    isRHEM?: boolean;
  };
  router: {
    useNavigate: () => RouterNavigateFunction;
    Link: typeof Link;
    appRoutes: Record<ROUTE, string>;
    NavLink: NavLinkFC;
    useSearchParams: typeof useSearchParams;
    useBlocker: typeof useBlocker;
    useParams: typeof useParams;
    Navigate: typeof Navigate;
    Route: typeof Route;
    Routes: typeof Routes;
    useLocation: typeof useLocation;
  };
  fetch: {
    getWsEndpoint: (deviceId: string) => string;
    get: <R>(kind: string, abortSignal?: AbortSignal) => Promise<R>;
    post: <TRequest, TResponse = TRequest>(
      kind: string,
      data: TRequest,
      abortSignal?: AbortSignal,
    ) => Promise<TResponse>;
    put: <TRequest>(kind: string, data: TRequest, abortSignal?: AbortSignal) => Promise<TRequest>;
    remove: <R>(kind: string, abortSignal?: AbortSignal) => Promise<R>;
    patch: <R>(kind: string, patches: PatchRequest, abortSignal?: AbortSignal) => Promise<R>;
    // All methods to the UI proxy are handled in the same method - returns raw Response
    proxyFetch: (endpoint: string, requestInit: RequestInit) => Promise<Response>;
  };
};

export const AppContext = React.createContext<AppContextProps>({
  appType: FlightCtlApp.STANDALONE,
  settings: {
    isRHEM: false,
  },
  router: {
    useNavigate,
    Link,
    appRoutes,
    NavLink: NavLink as NavLinkFC,
    useParams,
    useBlocker,
    useSearchParams,
    Route,
    Routes,
    Navigate,
    useLocation,
  },
  i18n: {
    transNamespace: undefined,
  },
  /* eslint-disable */
  fetch: {
    getWsEndpoint: () => '',
    get: async () => ({}) as any,
    post: async () => ({}) as any,
    put: async () => ({}) as any,
    remove: async () => ({}) as any,
    patch: async () => ({}) as any,
    proxyFetch: async () => ({}) as any,
  },
  /* eslint-enable */
});

export const useAppContext = () => React.useContext(AppContext);
