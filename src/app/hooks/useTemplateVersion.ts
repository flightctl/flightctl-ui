import { Device, TemplateVersion } from '@types';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { getDeviceFleet } from '@app/utils/devices';

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
