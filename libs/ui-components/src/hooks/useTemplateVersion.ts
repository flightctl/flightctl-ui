import { Device, TemplateVersion } from '@flightctl/types';
import { useFetchPeriodically } from './useFetchPeriodically';
import { getDeviceFleet } from '../utils/devices';
import { getMetadataAnnotation } from '../utils/api';
import { DeviceAnnotation } from '../types/extraTypes';

export const useTemplateVersion = (
  device: Device | undefined,
): [boolean, TemplateVersion | undefined, boolean, unknown] => {
  let templateVersion: string | undefined;
  let ownerFleet: string | null | undefined;
  if (device?.metadata) {
    templateVersion = getMetadataAnnotation(device?.metadata, DeviceAnnotation.TemplateVersion);
    ownerFleet = getDeviceFleet(device?.metadata);
  }

  const shouldFetchTVs = !!(templateVersion && ownerFleet);
  const [tv, isLoading, error] = useFetchPeriodically<TemplateVersion>({
    endpoint: shouldFetchTVs ? `fleets/${ownerFleet}/templateversions/${templateVersion}` : '',
  });

  return [shouldFetchTVs, tv, isLoading && shouldFetchTVs, error];
};
