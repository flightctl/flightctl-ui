import { Fleet } from '@flightctl/types';
import { getFleetSyncStatus } from '../status/fleet';

export const sortFleetsByOSImg = (fleets: Array<Fleet>) =>
  fleets.sort((a, b) => {
    const aOS = a.spec.template.spec.os?.image || '-';
    const bOS = b.spec.template.spec.os?.image || '-';
    return aOS.localeCompare(bOS);
  });

export const sortByStatus = (fleets: Array<Fleet>) =>
  fleets.sort((a, b) => {
    const aStatus = getFleetSyncStatus(a).status;
    const bStatus = getFleetSyncStatus(b).status;
    return aStatus.localeCompare(bStatus);
  });
