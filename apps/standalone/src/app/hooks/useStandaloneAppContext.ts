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
import { useAuth } from './useAuth';
import { DeviceImages, fetchImages } from '../utils/apiCalls';

const standaloneAppContext: Omit<AppContextProps, 'fetch' | 'metrics' | 'bootcImgUrl' | 'qcow2ImgUrl'> = {
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
  const auth = useAuth();
  const fetch = useFetch();
  const metrics = useMetrics();

  const [deviceImages, setDeviceImages] = React.useState<DeviceImages>({
    qcow2: '',
    bootc: '',
  });

  React.useEffect(() => {
    const getImages = async () => {
      try {
        const imgs = await fetchImages();
        setDeviceImages(imgs);
      } catch (err) {
        // eslint-disable-next-line
        console.warn('Failed to fetch device images');
        // eslint-disable-next-line
        console.error(err);
      }
    };
    getImages();
  }, []);

  return {
    ...standaloneAppContext,
    bootcImgUrl: deviceImages.bootc,
    qcow2ImgUrl: deviceImages.qcow2,
    user: auth?.user?.profile.preferred_username,
    fetch,
    metrics,
  };
};
