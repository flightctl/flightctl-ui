import { type Fleet, ResourceKind } from '@flightctl/types';

import { getOwnerName } from '../utils/resource';
import { useFetchPeriodically } from './useFetchPeriodically';

export const useDeviceOwnerFleet = (
  deviceOwner: string | undefined,
): [boolean, Fleet | undefined, boolean, unknown] => {
  const fleetOwnerName = deviceOwner ? getOwnerName(ResourceKind.FLEET, deviceOwner) : undefined;
  const [ownerFleet, isLoading, error] = useFetchPeriodically<Fleet>({
    endpoint: fleetOwnerName ? `fleets/${fleetOwnerName}` : '',
  });

  const hasOwnerFleet = Boolean(fleetOwnerName);
  return [hasOwnerFleet, ownerFleet, isLoading && hasOwnerFleet, error];
};
