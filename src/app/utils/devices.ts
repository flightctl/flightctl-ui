import { Device } from '@types';

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

const getDeviceFleet = (device: Device) => {
  const match = deviceFleetRegExp.exec(device.metadata.owner || '');
  return match?.groups?.fleetName || null;
};

export { getDeviceFleet };
