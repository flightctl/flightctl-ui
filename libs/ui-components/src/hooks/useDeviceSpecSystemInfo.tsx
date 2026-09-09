import React from 'react';
import type { TFunction } from 'react-i18next';

import type { DeviceSystemInfo } from '@flightctl/types';

export type SystemInfoEntry = {
  title: string;
  value: React.ReactNode;
};

// Converts a camelCase variable into words. Example: "someInfoData" --> "Some info data"
// Keeps acronyms together, converted to lowercase. Example: "bootID" --> Boot id
const propNameToTitle = (input: string) => {
  const words = input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
};

const excludedKnownProps = [
  'distroVersion', // It's combined with "distroName"
  'customInfo', // Custom properies are evaluated separately from the predefined, known properties
  'attestation', // In Phase1 this includes only the raw data, without a report of success or failure.
];

const getInfoDataKnownKeys = (t: TFunction) => ({
  agentVersion: t('Agent version'),
  operatingSystem: t('Operating system'),
  hostname: t('Hostname'),
  tpmVendorInfo: t('TPM vendor info'),
  architecture: t('Architecture'),
  distroName: t('Distro'),
  bootID: t('Boot ID'),
  kernel: t('Kernel'),
  netInterfaceDefault: t('Net interface default'),
  netIpDefault: t('Net IP default'),
  netMacDefault: t('Net MAC default'),
  productName: t('Product name'),
  productSerial: t('Product serial'),
  productUuid: t('Product UUID'),
});

const getSystemInfoValue = (systemInfo: DeviceSystemInfo, infoKey: string) => {
  switch (infoKey) {
    case 'distroName': {
      if (systemInfo.distroVersion) {
        return `${systemInfo.distroName} ${systemInfo.distroVersion}`;
      }
      return systemInfo.distroName;
    }
    default:
      return systemInfo[infoKey];
  }
};

export const useDeviceSpecSystemInfo = (systemInfo: DeviceSystemInfo | undefined, t: TFunction): SystemInfoEntry[] => {
  const infoDataKnownKeys = React.useMemo(() => getInfoDataKnownKeys(t), [t]);
  if (!systemInfo) {
    return [];
  }

  // Add the known fields first, in their desired order of appearance
  const systemInfoItems = Object.entries(infoDataKnownKeys)
    .filter(([infoKey]) => {
      return !excludedKnownProps.includes(infoKey) && systemInfo[infoKey];
    })
    .map(([infoKey, infoTitle]) => ({
      title: infoTitle,
      value: getSystemInfoValue(systemInfo, infoKey),
    }));

  // Add any other fields that weren't included yet, in arbitrary order
  Object.keys(systemInfo).forEach((infoKey) => {
    if (infoDataKnownKeys[infoKey] || excludedKnownProps.includes(infoKey)) {
      return;
    }
    const value = systemInfo[infoKey];
    if (value) {
      systemInfoItems.push({
        title: propNameToTitle(infoKey),
        value,
      });
    }
  });

  return systemInfoItems;
};
