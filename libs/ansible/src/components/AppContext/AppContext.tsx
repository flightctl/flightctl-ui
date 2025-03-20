import * as React from 'react';
import { AppContext, AppContextProps, FlightCtlApp, NavLinkFC } from '@flightctl/ui-components/src/hooks/useAppContext';
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
import { useFetch } from '../../hooks/useFetch';
import { useMetrics } from '../../hooks/useMetrics';

import { appRoutes } from '../../const';

export const AnsibleAppContext = AppContext.Provider;

type GetCookie = (cookieName: string) => string | undefined;

export const useValuesAppContext = (getCookie: GetCookie, serviceUrl: string | undefined): AppContextProps => {
  const fetch = useFetch(getCookie, serviceUrl);
  const metrics = useMetrics();

  return {
    appType: FlightCtlApp.AAP,
    user: '',
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
    i18n: {
      transNamespace: 'plugin__flightctl-plugin',
    },
    fetch,
    metrics,
  };
};

export const FctlAppContext = ({
  getCookie,
  serviceUrl,
  children,
}: React.PropsWithChildren<{ getCookie: GetCookie; serviceUrl: string | undefined }>) => {
  const value = useValuesAppContext(getCookie, serviceUrl);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
