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

const appRoutes = {
  [ROUTE.ROOT]: '/',
  [ROUTE.FLEETS]: '/edge/fleets',
  [ROUTE.FLEET_DETAILS]: '/edge/fleets',
  [ROUTE.FLEET_CREATE]: '/edge/fleets/create',
  [ROUTE.FLEET_EDIT]: '/edge/fleets/edit',
  [ROUTE.FLEET_IMPORT]: '/edge/fleets/import',
  [ROUTE.DEVICES]: '/edge/devices',
  [ROUTE.DEVICE_DETAILS]: '/edge/devices',
  [ROUTE.REPO_CREATE]: '/edge/repositories/create',
  [ROUTE.REPO_EDIT]: '/edge/repositories/edit',
  [ROUTE.REPO_DETAILS]: '/edge/repositories',
  [ROUTE.REPOSITORIES]: '/edge/repositories',
  [ROUTE.RESOURCE_SYNCS]: '/edge/resourcesyncs',
  [ROUTE.RESOURCE_SYNC_DETAILS]: '/edge/resourcesyncs',
  [ROUTE.ENROLLMENT_REQUESTS]: '/edge/enrollmentrequests',
  [ROUTE.ENROLLMENT_REQUEST_DETAILS]: '/edge/enrollmentrequests',
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
      appRoutes,
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
