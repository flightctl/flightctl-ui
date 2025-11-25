import { ConditionStatus, ConditionType } from '@flightctl/types';
import { API_VERSION } from '../../support/constants';

const approvedErStatus = {
  approval: {
    approved: true,
    approvedAt: '2024-04-10T12:13:45Z',
    approvedBy: 'unknown',
    labels: { alias: 'east-device', fleet: 'eu-east-prod-001', region: 'spain' },
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

const getErList = (onlyPending: boolean) =>
  [
    {
      apiVersion: API_VERSION,
      kind: 'EnrollmentRequest',
      metadata: {
        creationTimestamp: '2024-04-10T11:48:43Z',
        labels: {},
        name: '16dc6416fa77392a00aa653f6bc7f6591f7b2611853950cb40c56d54f31c128b',
      },
      spec: {
        csr: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
      },
      status: approvedErStatus,
    },
    {
      apiVersion: API_VERSION,
      kind: 'EnrollmentRequest',
      metadata: {
        creationTimestamp: '2024-04-10T12:15:31Z',
        labels: {},
        name: 'a021622d8633782719874da4052f957faa742fc7050026748bc79065c8819d139',
      },
      spec: {
        csr: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
      },
      status: { conditions: [] },
    },
    {
      apiVersion: API_VERSION,
      kind: 'EnrollmentRequest',
      metadata: {
        creationTimestamp: '2024-04-10T09:31:04Z',
        labels: {},
        name: 'da9980707b202ad5dfe0a21444bfe2c47f9731947ac86efee6e3a3dfe8b5c736',
      },
      spec: {
        csr: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
      },
      status: approvedErStatus,
    },
    {
      apiVersion: API_VERSION,
      kind: 'EnrollmentRequest',
      metadata: {
        creationTimestamp: '2024-10-10T12:15:31Z',
        labels: {},
        name: '051aad6133782719874da4052f957faa742fc70500267873f79066f',
      },
      spec: {
        csr: '-----BEGIN CERTIFICATE-----\nCERTIFICATE CONTENT\n-----END CERTIFICATE-----\n',
      },
      status: { conditions: [] },
    },
  ].filter((er) => {
    return onlyPending ? er.status.conditions.length === 0 : true;
  });

export { getErList };
