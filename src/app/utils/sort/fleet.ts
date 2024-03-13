import { Fleet } from '@types';

export const sortFleetsByOSImg = (resources: Fleet[]) =>
  resources.sort((a, b) => {
    const aOS = a.spec.template.spec.os?.image || '-';
    const bOS = b.spec.template.spec.os?.image || '-';
    return aOS.localeCompare(bOS);
  });
