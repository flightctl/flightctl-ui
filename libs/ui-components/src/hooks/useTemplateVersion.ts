import { Device, TemplateVersion } from '@flightctl/types';
import { useFetchPeriodically } from './useFetchPeriodically';
import { getDeviceFleet } from '../utils/devices';

export const useTemplateVersion = (
  device: Device | undefined,
): [boolean, TemplateVersion | undefined, boolean, unknown] => {
  const templateVersion = device?.spec?.templateVersion || '';

  const ownerFleet = device?.metadata ? getDeviceFleet(device?.metadata) : undefined;
  const shouldFetchTVs = !!(templateVersion && ownerFleet);
  const [tv, isLoading, error] = useFetchPeriodically<TemplateVersion>({
    endpoint: shouldFetchTVs ? `fleets/${ownerFleet}/templateversions/${templateVersion}` : '',
  });

  return [shouldFetchTVs, tv, isLoading && shouldFetchTVs, error];
};
