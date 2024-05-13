import { AppContext, AppContextProps } from '@flightctl/ui-components/hooks/useAppContext';
import { ROUTE } from '@flightctl/ui-components/hooks/useNavigate';
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
import { useFetch } from '../../hooks/useFetch';
import { useMetrics } from '../../hooks/useMetrics';

export const OCPPluginAppContext = AppContext.Provider;

const getRoute: AppContextProps['router']['getRoute'] = (to) => {
  switch (to) {
    case ROUTE.FLEETS:
    case ROUTE.FLEET_DETAILS:
      return '/edge/fleets';
    case ROUTE.FLEET_CREATE:
      return '/edge/fleets/create';
    case ROUTE.FLEET_EDIT:
      return '/edge/fleets/edit';
    case ROUTE.FLEET_IMPORT:
      return '/edge/fleets/import';
    case ROUTE.DEVICES:
      return '/edge/devices';
    case ROUTE.REPO_CREATE:
      return '/edge/repositories/create';
    case ROUTE.REPO_EDIT:
      return '/edge/repositories/edit';
    case ROUTE.REPO_DETAILS:
    case ROUTE.REPOSITORIES:
      return '/edge/repositories';
    case ROUTE.RESOURCE_SYNCS:
    case ROUTE.RESOURCE_SYNC_DETAILS:
      return '/edge/resourcesyncs';
    case ROUTE.ENROLLMENT_REQUESTS:
    case ROUTE.ENROLLMENT_REQUEST_DETAILS:
      return '/edge/enrollmentrequests';
    default:
      return '/';
  }
};

export const useValuesAppContext = (): AppContextProps => {
  const fetch = useFetch();
  const metrics = useMetrics();
  return {
    appType: 'ocp',
    user: undefined, // TODO how to get username ?
    bootcImgUrl: '1',
    qcow2ImgUrl: '',
    router: {
      useNavigate,
      Link,
      getRoute,
      NavLink,
      Routes,
      Navigate,
      Route,
      useParams,
      useSearchParams,
      useLocation,
    },
    i18n: {
      transNamespace: 'plugin__flightctl-plugin',
    },
    fetch,
    metrics,
  };
};
