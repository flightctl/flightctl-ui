import { ObjectMeta } from '@flightctl/types';

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match?.groups?.fleetName || null;
};

export { getDeviceFleet };
