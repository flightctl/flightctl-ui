import { ConditionStatus, ConditionType, EnrollmentRequest } from '@flightctl/types';

const approvedErStatus = {
  approval: {
    approved: true,
    approvedAt: '2024-04-10T12:13:45Z',
    approvedBy: 'unknown',
    labels: { displayName: 'east-device', fleet: 'eu-east-prod-001', region: 'spain' },
    region: 'spain',
  },
  certificate: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
  conditions: [
    {
      lastTransitionTime: '2024-04-10T12:13:45Z',
      message: 'Approved by unknown',
      reason: 'ManuallyApproved',
      status: ConditionStatus.ConditionStatusTrue,
      type: ConditionType.EnrollmentRequestApproved,
    },
  ],
};

const erList: EnrollmentRequest[] = [
  {
    apiVersion: 'v1alpha1',
    kind: 'EnrollmentRequest',
    metadata: {
      creationTimestamp: '2024-04-10T11:48:43Z',
      labels: {},
      name: '16dc6416fa77392a00aa653f6bc7f6591f7b2611853950cb40c56d54f31c128b',
    },
    spec: {
      csr: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
      deviceStatus: {
        conditions: [
          { reason: 'Bootstrap', status: ConditionStatus.ConditionStatusTrue, type: ConditionType.DeviceProgressing },
          { reason: 'AsExpected', status: ConditionStatus.ConditionStatusFalse, type: ConditionType.DeviceDegraded },
        ],
        containers: [],
        systemInfo: {
          architecture: 'amd64',
          bootID: '66df34c3-9b9e-4a7e-98e6-74236d9e84b3',
          machineID: '0817bbf9d57d45bcbbbf98a1b0a65937',
          measurements: {
            pcr01: '0000000000000000000000000000000000000000000000000000000000000000',
            pcr02: '0000000000000000000000000000000000000000000000000000000000000000',
            pcr03: '0000000000000000000000000000000000000000000000000000000000000000',
          },
          operatingSystem: 'linux',
        },
      },
    },
    status: approvedErStatus,
  },
  {
    apiVersion: 'v1alpha1',
    kind: 'EnrollmentRequest',
    metadata: {
      creationTimestamp: '2024-04-10T12:15:31Z',
      labels: {},
      name: 'a021622d8633782719874da4052f957faa742fc7050026748bc79065c8819d139',
    },
    spec: {
      csr: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
      deviceStatus: {
        conditions: [
          { reason: 'Bootstrap', status: ConditionStatus.ConditionStatusTrue, type: ConditionType.DeviceProgressing },
          { reason: 'AsExpected', status: ConditionStatus.ConditionStatusFalse, type: ConditionType.DeviceDegraded },
        ],
        containers: [],
        systemInfo: {
          architecture: 'amd64',
          bootID: 'cd78757a-58b5-4a4c-8531-191b1b4c6885',
          machineID: '55019a1bf5b946cf81be94507d7815c9',
          measurements: {
            pcr01: '0000000000000000000000000000000000000000000000000000000000000000',
            pcr02: '0000000000000000000000000000000000000000000000000000000000000000',
            pcr03: '0000000000000000000000000000000000000000000000000000000000000000',
          },
          operatingSystem: 'linux',
        },
      },
    },
    status: { conditions: [] },
  },
  {
    apiVersion: 'v1alpha1',
    kind: 'EnrollmentRequest',
    metadata: {
      creationTimestamp: '2024-04-10T09:31:04Z',
      labels: {},
      name: 'da9980707b202ad5dfe0a21444bfe2c47f9731947ac86efee6e3a3dfe8b5c736',
    },
    spec: {
      csr: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
      deviceStatus: {
        conditions: [
          { reason: 'Bootstrap', status: ConditionStatus.ConditionStatusTrue, type: ConditionType.DeviceProgressing },
          { reason: 'AsExpected', status: ConditionStatus.ConditionStatusFalse, type: ConditionType.DeviceDegraded },
        ],
        containers: [],
        systemInfo: {
          architecture: 'amd64',
          bootID: 'a5356414-a016-43ea-a063-5e1cafc0c26a',
          machineID: '722247f0a46144b59ac6aa9306f3dd8a',
          measurements: {
            pcr01: '0000000000000000000000000000000000000000000000000000000000000000',
            pcr02: '0000000000000000000000000000000000000000000000000000000000000000',
          },
          operatingSystem: 'linux',
        },
      },
    },
    status: approvedErStatus,
  },
];

export { erList };
