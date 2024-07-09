import * as React from 'react';
import { Device } from '@flightctl/types';
import { useAppContext } from '../../../hooks/useAppContext';
import { useFetch } from '../../../hooks/useFetch';

export const useEditDevice = (): [string | undefined, Device | undefined, boolean, unknown] => {
  const {
    router: { useParams },
  } = useAppContext();
  const { deviceId } = useParams<{ deviceId: string }>();

  const { get } = useFetch();
  const [device, setDevice] = React.useState<Device>();
  const [isLoading, setIsLoading] = React.useState<boolean>(!!deviceId);
  const [error, setError] = React.useState<unknown>();

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const result = await get<Device>(`device/${deviceId}`);
        setDevice(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (deviceId && !device) {
      fetch();
    }
  }, [deviceId, get, device]);

  return [deviceId, device, isLoading, error];
};
