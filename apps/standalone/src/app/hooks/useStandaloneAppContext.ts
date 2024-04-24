import { AppContextProps } from '@flightctl/ui-components/hooks/useAppContext';
import { getRoute } from '@flightctl/ui-components/hooks/useNavigate';
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
} from 'react-router-dom';
import { useFetch } from './useFetch';
import { useMetrics } from './useMetrics';
import { useAuth } from './useAuth';

const standaloneAppContext: Omit<AppContextProps, 'fetch' | 'metrics'> = {
  appType: 'standalone',
  i18n: {
    transNamespace: undefined,
  },
  bootcImgUrl: window.BOOTC_IMG_URL,
  qcow2ImgUrl: window.QCOW2_IMG_URL,
  router: {
    useNavigate,
    Link,
    getRoute,
    NavLink,
    Navigate,
    Route,
    useParams,
    useSearchParams,
    Routes,
    useLocation,
  },
};

export const useStandaloneAppContext = (): AppContextProps => {
  const auth = useAuth();
  const fetch = useFetch();
  const metrics = useMetrics();

  return {
    ...standaloneAppContext,
    user: auth?.user?.profile.preferred_username,
    fetch,
    metrics,
  };
};
