import * as React from 'react';
import { AppContextProps, NavLinkFC, appRoutes } from '@flightctl/ui-components/src/hooks/useAppContext';
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
import { useFetch } from './useFetch';
import { useMetrics } from './useMetrics';
import { AuthContext } from '../context/AuthContext';

const standaloneAppContext: Omit<AppContextProps, 'fetch' | 'metrics'> = {
  appType: 'standalone',
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
  const metrics = useMetrics();

  return {
    ...standaloneAppContext,
    user: username,
    fetch,
    metrics,
  };
};
