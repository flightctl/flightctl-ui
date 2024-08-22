import * as React from 'react';
import { AppContext, AppContextProps, NavLinkFC, PromptFC } from '@flightctl/ui-components/src/hooks/useAppContext';
import { ROUTE } from '@flightctl/ui-components/src/hooks/useNavigate';
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
import { Prompt } from 'react-router-dom';
import { getUser } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers';
import { useSelector } from 'react-redux';
import { useFetch } from '../../hooks/useFetch';
import { useMetrics } from '../../hooks/useMetrics';
import { DeviceImages, fetchImages } from '../../utils/apiCalls';

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
  [ROUTE.DEVICE_EDIT]: '/edge/devices/edit',
  [ROUTE.REPO_CREATE]: '/edge/repositories/create',
  [ROUTE.REPO_EDIT]: '/edge/repositories/edit',
  [ROUTE.REPO_DETAILS]: '/edge/repositories',
  [ROUTE.REPOSITORIES]: '/edge/repositories',
  [ROUTE.RESOURCE_SYNC_DETAILS]: '/edge/resourcesyncs',
  [ROUTE.ENROLLMENT_REQUESTS]: '/edge/enrollmentrequests',
  [ROUTE.ENROLLMENT_REQUEST_DETAILS]: '/edge/enrollmentrequests',
};

export const useValuesAppContext = (): AppContextProps => {
  const fetch = useFetch();
  const metrics = useMetrics();
  const userInfo = useSelector(getUser);

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
    appType: 'ocp',
    user: userInfo?.username || '',
    bootcImgUrl: deviceImages.bootc,
    qcow2ImgUrl: deviceImages.qcow2,
    router: {
      Link,
      appRoutes,
      NavLink: NavLink as NavLinkFC,
      Routes,
      Navigate,
      Route,
      useLocation,
      useNavigate,
      useParams,
      useSearchParams,
      Prompt: Prompt as PromptFC,
    },
    i18n: {
      transNamespace: 'plugin__flightctl-plugin',
    },
    fetch,
    metrics,
  };
};
