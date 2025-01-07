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
import { RESOURCE, VERB } from '../types/rbac';

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
};

export type NavLinkFC = React.FC<{ to: string; children: (props: { isActive: boolean }) => React.ReactNode }>;
export type PromptFC = React.FC<{ message: string }>;

export type AppContextProps = {
  appType: 'standalone' | 'ocp' | 'aap';
  user?: string; // auth?.user?.profile.preferred_username
  i18n: {
    transNamespace?: string;
  };
  router: {
    useNavigate: () => RouterNavigateFunction;
    Link: typeof Link;
    appRoutes: Record<ROUTE, string>;
    NavLink: NavLinkFC;
    useSearchParams: typeof useSearchParams;
    useBlocker?: typeof useBlocker;
    useParams: typeof useParams;
    Navigate: typeof Navigate;
    Route: typeof Route;
    Routes: typeof Routes;
    useLocation: typeof useLocation;
    Prompt?: PromptFC;
  };
  fetch: {
    getWsEndpoint: () => { wsEndpoint: string; protocols: string[] };
    get: <R>(kind: string, abortSignal?: AbortSignal) => Promise<R>;
    post: <R>(kind: string, data: R, abortSignal?: AbortSignal) => Promise<R>;
    put: <R>(kind: string, data: R, abortSignal?: AbortSignal) => Promise<R>;
    remove: <R>(kind: string, abortSignal?: AbortSignal) => Promise<R>;
    patch: <R>(kind: string, patches: PatchRequest, abortSignal?: AbortSignal) => Promise<R>;
    checkPermissions: (resource: RESOURCE, verb: VERB) => Promise<boolean>;
  };
  metrics: {
    get: <R>(query: string, abortSignal?: AbortSignal) => Promise<R>;
  };
};

export const AppContext = React.createContext<AppContextProps>({
  appType: 'standalone',
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
    getWsEndpoint: () => ({ wsEndpoint: '', protocols: [''] }),
    get: async () => ({}) as any,
    post: async () => ({}) as any,
    put: async () => ({}) as any,
    remove: async () => ({}) as any,
    patch: async () => ({}) as any,
    checkPermissions: async () => true,
  },
  metrics: {
    get: async () => ({}) as any,
  },
  /* eslint-enable */
});

export const useAppContext = () => React.useContext(AppContext);
