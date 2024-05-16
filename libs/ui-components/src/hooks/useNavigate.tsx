import * as React from 'react';
import { LinkProps as RouterLinkProps } from 'react-router-dom';
import { useAppContext } from './useAppContext';

export interface NavigateFunction {
  (to: Route | ToObj): void;
  (delta: number): void;
}

export enum ROUTE {
  ROOT = 'ROOT',
  FLEETS = 'FLEETS',
  FLEET_CREATE = 'FLEET_CREATE',
  FLEET_IMPORT = 'FLEET_IMPORT',
  FLEET_DETAILS = ' FLEET_DETAILS',
  FLEET_EDIT = 'FLEET_DETAILS',
  DEVICES = 'DEVICES',
  DEVICE_DETAILS = 'DEVICE_DETAILS',
  REPOSITORIES = 'REPOSITORIES',
  REPO_CREATE = 'REPO_CREATE',
  REPO_EDIT = 'REPO_EDIT',
  REPO_DETAILS = ' REPO_DETAILS',
  RESOURCE_SYNCS = ' RESOURCE_SYNCS',
  RESOURCE_SYNC_DETAILS = ' RESOURCE_SYNC_DETAILS',
  ENROLLMENT_REQUESTS = 'ENROLLMENT_REQUESTS',
  ENROLLMENT_REQUEST_DETAILS = 'ENROLLMENT_REQUEST_DETAILS',
}

export type RouteWithPostfix =
  | ROUTE.FLEET_DETAILS
  | ROUTE.FLEET_EDIT
  | ROUTE.REPO_DETAILS
  | ROUTE.RESOURCE_SYNC_DETAILS
  | ROUTE.REPO_EDIT
  | ROUTE.DEVICE_DETAILS
  | ROUTE.ENROLLMENT_REQUEST_DETAILS;
export type Route = Exclude<ROUTE, RouteWithPostfix>;

type ToObj = { route: RouteWithPostfix; postfix: string | undefined };

export const useNavigate = () => {
  const {
    router: { useNavigate: useRouterNavigate, appRoutes },
  } = useAppContext();

  const navigate = useRouterNavigate();

  return React.useCallback<NavigateFunction>(
    (to: Route | number | ToObj) => {
      if (typeof to === 'number') {
        navigate(to);
      } else {
        if (toParamIsToObj(to)) {
          const route = appRoutes[to.route];
          navigate(`${route}/${to.postfix}`);
        } else {
          const route = appRoutes[to];
          navigate(route);
        }
      }
    },
    [navigate, appRoutes],
  );
};

type LinkProps = Omit<RouterLinkProps, 'to'> & {
  to: Route | ToObj;
  query?: string;
};

const toParamIsToObj = (to: LinkProps['to']): to is ToObj => {
  if (typeof to === 'object') {
    return 'route' in to;
  }
  return false;
};

export const Link = ({ to, query, ...rest }: LinkProps) => {
  const {
    router: { Link: RouterLink, appRoutes },
  } = useAppContext();

  let route = '';
  if (toParamIsToObj(to)) {
    route = `${appRoutes[to.route]}/${to.postfix}`;
  } else {
    route = appRoutes[to];
  }

  return <RouterLink to={query ? `${route}?${query}` : route} {...rest} />;
};
