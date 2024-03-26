import { isFleet } from '@app/types/extraTypes';
import { Fleet, ResourceSync } from '@types';
import { getRepositorySyncStatus } from '../status/repository';
import { getFleetStatusType } from '../status/fleet';

export const sortFleetsByOSImg = (resources: Array<Fleet | ResourceSync>) =>
  resources.sort((a, b) => {
    const aOS = (isFleet(a) && a.spec.template.spec.os?.image) || '-';
    const bOS = (isFleet(b) && b.spec.template.spec.os?.image) || '-';
    return aOS.localeCompare(bOS);
  });

export const sortByStatus = (resources: Array<Fleet | ResourceSync>) =>
  resources.sort((a, b) => {
    const aStatus = isFleet(a) ? getFleetStatusType(a) : getRepositorySyncStatus(a).status;
    const bStatus = isFleet(b) ? getFleetStatusType(b) : getRepositorySyncStatus(b).status;
    return aStatus.localeCompare(bStatus);
  });
