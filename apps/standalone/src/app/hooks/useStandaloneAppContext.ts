import * as React from 'react';
import { AppContextProps, FlightCtlApp, NavLinkFC, appRoutes } from '@flightctl/ui-components/src/hooks/useAppContext';
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
} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useFetch } from './useFetch';
import { fetchAlerts, fetchCliArtifacts } from '../utils/apiCalls';

const standaloneAppContext: Omit<AppContextProps, 'fetch' | 'settings'> = {
  appType: FlightCtlApp.STANDALONE,
  i18n: {
    transNamespace: undefined,
  },
  router: {
    useNavigate,
    Link,
    appRoutes,
    NavLink: NavLink as NavLinkFC,
    Navigate,
    Route,
    useBlocker,
    useParams,
    useSearchParams,
    Routes,
    useLocation,
  },
};

export const useStandaloneAppContext = (): AppContextProps => {
  const { username } = React.useContext(AuthContext);
  const fetch = useFetch();

  return {
    ...standaloneAppContext,
    settings: {
      isRHEM: window.isRHEM || false,
    },
    user: username,
    fetch,
    getAlerts: fetchAlerts,
    getCliArtifacts: fetchCliArtifacts,
  };
};
