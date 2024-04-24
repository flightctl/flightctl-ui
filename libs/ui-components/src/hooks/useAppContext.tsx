import * as React from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  NavigateFunction as RouterNavigateFunction,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { ROUTE, getRoute } from './useNavigate';

export type AppContextProps = {
  appType: 'standalone' | 'ocp';
  qcow2ImgUrl: string | undefined;
  bootcImgUrl: string | undefined;
  user?: string; // auth?.user?.profile.preferred_username
  i18n: {
    transNamespace?: string;
  };
  router: {
    useNavigate: () => RouterNavigateFunction;
    Link: typeof Link;
    getRoute: (route: ROUTE) => string;
    NavLink: typeof NavLink;
    useSearchParams: typeof useSearchParams;
    useParams: typeof useParams;
    Navigate: typeof Navigate;
    Route: typeof Route;
    Routes: typeof Routes;
    useLocation: typeof useLocation;
  };
  fetch: {
    get: <R>(kind: string, abortSignal?: AbortSignal) => Promise<R>;
    put: <R>(kind: string, data: R, abortSignal?: AbortSignal) => Promise<R>;
    post: <R>(kind: string, data: R, abortSignal?: AbortSignal) => Promise<R>;
    remove: <R>(kind: string, abortSignal?: AbortSignal) => Promise<R>;
  };
  metrics: {
    get: <R>(query: string, abortSignal?: AbortSignal) => Promise<R>;
  };
};

export const AppContext = React.createContext<AppContextProps>({
  appType: 'standalone',
  qcow2ImgUrl: undefined,
  bootcImgUrl: undefined,
  router: {
    useNavigate,
    Link,
    getRoute,
    NavLink,
    useParams,
    useSearchParams,
    Route,
    Routes,
    Navigate,
    useLocation,
  },
  i18n: {
    transNamespace: undefined,
  },
  fetch: {
    // eslint-disable-next-line
    get: async () => ({}) as any,
    // eslint-disable-next-line
    put: async () => ({}) as any,
    // eslint-disable-next-line
    post: async () => ({}) as any,
    // eslint-disable-next-line
    remove: async () => ({}) as any,
  },
  metrics: {
    // eslint-disable-next-line
    get: async () => ({}) as any,
  },
});

export const useAppContext = () => React.useContext(AppContext);
