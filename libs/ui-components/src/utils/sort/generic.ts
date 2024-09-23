import { Device, EnrollmentRequest, ObjectMeta } from '@flightctl/types';

export const sortByName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aName = a.metadata.name || '-';
    const bName = b.metadata.name || '-';
    return aName.localeCompare(bName);
  });

export const sortByLastSeenDate = (devices: Device[]) =>
  devices.sort((a, b) => {
    const getDate = (device: Device) => {
      const lastSeen = device.status?.lastSeen;
      if (lastSeen) {
        return lastSeen;
      }
      return device.metadata.creationTimestamp || 0;
    };

    const aDate = getDate(a);
    const bDate = getDate(b);
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

export const sortByCreationDate = (enrollments: EnrollmentRequest[]) =>
  enrollments.sort((a, b) => {
    const aDate = a.metadata.creationTimestamp || 0;
    const bDate = b.metadata.creationTimestamp || 0;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

export const sortByAlias = (devices: Device[]) =>
  devices.sort((a, b) => {
    const aAlias = a.metadata.labels?.alias || '-';
    const bAlias = b.metadata.labels?.alias || '-';
    return aAlias.localeCompare(bAlias);
  });
