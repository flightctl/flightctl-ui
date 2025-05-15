import React from 'react';
import { TFunction } from 'react-i18next';

import { CustomDeviceInfo, DeviceSystemInfo } from '@flightctl/types';

// The API definition doesn't handle "customInfo" correctly
export type FixedDeviceSystemInfo = DeviceSystemInfo & {
  customInfo?: CustomDeviceInfo;
};

type SystemInfoEntry = {
  title: string;
  value: string;
};

// Converts a camelCase variable into words. Example: "someInfoData" --> "Some info data"
// Keeps acronyms together, converted to lowercase. Example: "bootID" --> Boot id
const propNameToTitle = (input: string) => {
  const words = input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
};

const emptySystemInfo = {
  baseInfo: [],
  customInfo: [],
};

const excludedKnownProps = [
  'distroVersion', // It's combined with "distroName"
  'customInfo', // Custom properies are evaluated separately from the predefined, known properties
];

const getInfoDataKnownKeys = (t: TFunction) => ({
  architecture: t('Architecture'),
  operatingSystem: t('Operating system'),
  agentVersion: t('Agent version'),
  distroName: t('Distro'),
  hostname: t('Hostname'),
  bootID: t('Boot ID'),
  kernel: t('Kernel'),
  netInterfaceDefault: t('Net interface default'),
  netIpDefault: t('Net IP default'),
  netMacDefault: t('Net MAC default'),
  productName: t('Product name'),
  productSerial: t('Product serial'),
  productUuid: t('Product UUID'),
  attestation: t('Attestation'),
  tpmVendorInfo: t('TPM vendor info'),
});

export const useDeviceSpecSystemInfo = (
  systemInfo: FixedDeviceSystemInfo | undefined,
  t: TFunction,
): {
  baseInfo: SystemInfoEntry[];
  customInfo: SystemInfoEntry[];
} => {
  const infoDataKnownKeys = React.useMemo(() => getInfoDataKnownKeys(t), [t]);
  if (!systemInfo) {
    return emptySystemInfo;
  }

  // First show the properties known to us, and only those that are set
  const baseInfoList = Object.entries(infoDataKnownKeys)
    .filter(([infoKey]) => {
      return !excludedKnownProps.includes(infoKey) && systemInfo[infoKey];
    })
    .map(([infoKey, infoTitle]) => {
      let infoDataValue: string;

      switch (infoKey) {
        case 'distroName':
          infoDataValue =
            'distroVersion' in systemInfo
              ? `${systemInfo.distroName} ${systemInfo.distroVersion}`
              : systemInfo.distroName;
          break;
        case 'attestation':
          infoDataValue = t('Information was gathered');
          break;
        default:
          infoDataValue = systemInfo[infoKey];
      }

      return {
        title: infoTitle,
        value: infoDataValue,
      };
    });

  // Skip the known properties added in the previous phase. And only add any additional property which has a value
  Object.keys(systemInfo).forEach((infoKey) => {
    if (infoDataKnownKeys[infoKey] || excludedKnownProps.includes(infoKey)) {
      return;
    }
    const value = systemInfo[infoKey];
    if (value) {
      baseInfoList.push({
        title: propNameToTitle(infoKey),
        value,
      });
    }
  });

  const customInfoList: SystemInfoEntry[] = [];
  try {
    const customInfo = systemInfo.customInfo || {};
    Object.keys(customInfo).forEach((customInfoKey) => {
      const value = customInfo[customInfoKey];
      if (value) {
        customInfoList.push({
          title: propNameToTitle(customInfoKey),
          value,
        });
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('customInfo is not an object:', systemInfo.customInfo);
  }

  return {
    baseInfo: baseInfoList,
    customInfo: customInfoList,
  };
};
