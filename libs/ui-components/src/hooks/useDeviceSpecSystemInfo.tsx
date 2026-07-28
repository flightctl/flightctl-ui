import React from 'react';
import { Label } from '@patternfly/react-core';
import OsImageIcon from '@patternfly/react-icons/dist/js/icons/os-image-icon';
import ArchiveIcon from '@patternfly/react-icons/dist/js/icons/archive-icon';
import type { TFunction } from 'react-i18next';

import { type CustomDeviceInfo, type DeviceStatus, type DeviceSystemInfo, OsModeType } from '@flightctl/types';

// Used to mark system info properties that we want to always display, regardless of whether they are set
const UnsetValue = 'unset';

// The API definition doesn't handle "customInfo" correctly
export type FixedDeviceSystemInfo = DeviceSystemInfo & {
  customInfo?: CustomDeviceInfo;
  osMode: OsModeType | typeof UnsetValue;
};

type SystemInfoEntry = {
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
  osMode: t('OS mode'),
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
  tpmVendorInfo: t('TPM vendor info'),
});

const buildSystemInfoAndCapabilities = (deviceStatus?: DeviceStatus): FixedDeviceSystemInfo => {
  return {
    ...(deviceStatus?.systemInfo ?? {}),
    osMode: deviceStatus?.capabilities?.osMode ?? UnsetValue,
  } as FixedDeviceSystemInfo;
};

const getSystemInfoValue = (systemInfo: FixedDeviceSystemInfo, infoKey: string, t: TFunction) => {
  switch (infoKey) {
    case 'distroName': {
      if (systemInfo.distroVersion) {
        return `${systemInfo.distroName} ${systemInfo.distroVersion}`;
      }
      return systemInfo.distroName;
    }
    case 'osMode': {
      if (systemInfo.osMode === UnsetValue) {
        return '-';
      }

      const isImageMode = systemInfo.osMode === OsModeType.OsModeImage;
      return (
        <Label variant="outline" isCompact icon={isImageMode ? <OsImageIcon /> : <ArchiveIcon />}>
          {isImageMode ? t('Image') : t('Package')}
        </Label>
      );
    }
    default:
      return systemInfo[infoKey];
  }
};

export const useDeviceSpecSystemInfo = (
  deviceStatus: DeviceStatus | undefined,
  t: TFunction,
): {
  baseInfo: SystemInfoEntry[];
  customInfo: SystemInfoEntry[];
} => {
  const infoDataKnownKeys = React.useMemo(() => getInfoDataKnownKeys(t), [t]);
  const systemInfo = buildSystemInfoAndCapabilities(deviceStatus);

  // First show the properties known to us, and only those that are set
  const baseInfoList = Object.entries(infoDataKnownKeys)
    .filter(([infoKey]) => {
      return !excludedKnownProps.includes(infoKey) && systemInfo[infoKey];
    })
    .map(([infoKey, infoTitle]) => {
      const infoDataValue = getSystemInfoValue(systemInfo, infoKey, t);

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
  } catch {
    // eslint-disable-next-line no-console
    console.warn('customInfo is not an object:', systemInfo.customInfo);
  }

  return {
    baseInfo: baseInfoList,
    customInfo: customInfoList,
  };
};
