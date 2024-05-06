import * as React from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import { useFetch } from '../../../hooks/useFetch';
import { Fleet } from '@flightctl/types';

export const useEditFleet = (): [string | undefined, Fleet | undefined, boolean, unknown] => {
  const {
    router: { useParams },
  } = useAppContext();
  const { fleetId } = useParams<{ fleetId: string }>();

  const { get } = useFetch();
  const [fleet, setFleet] = React.useState<Fleet>();
  const [isLoading, setIsLoading] = React.useState<boolean>(!!fleetId);
  const [error, setError] = React.useState<unknown>();

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const result = await get<Fleet>(`fleets/${fleetId}`);
        setFleet(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (fleetId && !fleet) {
      fetch();
    }
  }, [fleetId, get, fleet]);

  return [fleetId, fleet, isLoading, error];
};
