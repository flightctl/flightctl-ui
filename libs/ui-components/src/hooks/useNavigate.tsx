import * as React from 'react';
import { LinkProps as RouterLinkProps } from 'react-router-dom';
import { AppContextProps, useAppContext } from './useAppContext';

export interface NavigateFunction {
  (to: Route | ToObj): void;
  (delta: number): void;
}

export enum ROUTE {
  ROOT,
  FLEETS,
  FLEET_CREATE,
  FLEET_IMPORT,
  FLEET_DETAILS,
  FLEET_EDIT,
  DEVICES,
  REPOSITORIES,
  REPO_CREATE,
  REPO_EDIT,
  REPO_DETAILS,
  RESOURCE_SYNCS,
  RESOURCE_SYNC_DETAILS,
  ENROLLMENT_REQUESTS,
  ENROLLMENT_REQUEST_DETAILS,
}

type RouteWithPostfix =
  | ROUTE.FLEET_DETAILS
  | ROUTE.FLEET_EDIT
  | ROUTE.REPO_DETAILS
  | ROUTE.RESOURCE_SYNC_DETAILS
  | ROUTE.REPO_EDIT
  | ROUTE.ENROLLMENT_REQUEST_DETAILS;
type Route = Exclude<ROUTE, RouteWithPostfix>;

type ToObj = { route: RouteWithPostfix; postfix: string | undefined };

export const getRoute: AppContextProps['router']['getRoute'] = (to) => {
  switch (to) {
    case ROUTE.FLEETS:
    case ROUTE.FLEET_DETAILS:
      return '/devicemanagement/fleets';
    case ROUTE.FLEET_CREATE:
      return '/devicemanagement/fleets/create';
    case ROUTE.FLEET_EDIT:
      return '/devicemanagement/fleets/edit';
    case ROUTE.FLEET_IMPORT:
      return '/devicemanagement/fleets/import';
    case ROUTE.DEVICES:
      return '/devicemanagement/devices';
    case ROUTE.REPO_CREATE:
      return '/devicemanagement/repositories/create';
    case ROUTE.REPO_EDIT:
      return '/devicemanagement/repositories/edit';
    case ROUTE.REPO_DETAILS:
    case ROUTE.REPOSITORIES:
      return '/devicemanagement/repositories';
    case ROUTE.RESOURCE_SYNCS:
    case ROUTE.RESOURCE_SYNC_DETAILS:
      return '/devicemanagement/resourcesyncs';
    case ROUTE.ENROLLMENT_REQUESTS:
    case ROUTE.ENROLLMENT_REQUEST_DETAILS:
      return '/devicemanagement/enrollmentrequests';
    default:
      return '/';
  }
};

export const useNavigate = () => {
  const {
    router: { useNavigate: useRouterNavigate, getRoute },
  } = useAppContext();

  const navigate = useRouterNavigate();

  return React.useCallback<NavigateFunction>(
    (to: Route | number | ToObj) => {
      if (typeof to === 'number') {
        navigate(to);
      }
      if (toParamIsToObj(to)) {
        const route = getRoute(to.route);
        navigate(`${route}/${to.postfix}`);
      } else {
        const route = getRoute(to);
        navigate(route);
      }
    },
    [navigate, getRoute],
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
    router: { Link: RouterLink, getRoute },
  } = useAppContext();

  let route = '';
  if (toParamIsToObj(to)) {
    route = `${getRoute(to.route)}/${to.postfix}`;
  } else {
    route = getRoute(to);
  }

  return <RouterLink to={query ? `${route}?${query}` : route} {...rest} />;
};
