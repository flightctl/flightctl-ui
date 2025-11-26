import { Fleet } from '@flightctl/types';
import { API_VERSION } from '../../support/constants';

const basicFleets: Fleet[] = [
  {
    apiVersion: API_VERSION,
    kind: 'Fleet',
    metadata: {
      creationTimestamp: '2024-04-10T12:11:54Z',
      generation: 1,
      labels: {},
      name: 'eu-east-prod-001',
      owner: 'ResourceSync/rs-basic-demo',
    },
    spec: {
      selector: {
        matchLabels: {
          fleet: 'eu-east-prod-001',
        },
      },
      template: {
        metadata: {
          generation: 1,
        },
        spec: {
          config: [
            {
              gitRef: {
                path: '/demos/basic-nginx-fleet/configuration/',
                repository: 'defaultRepo',
                targetRevision: 'main',
              },
              name: 'example-server',
            },
          ],
          os: {
            image: 'quay.io/solar-farms/ai-inverter:1.5.0',
          },
          systemd: {
            matchPatterns: ['inverter.service', 'rs485-protocol.service'],
          },
        },
      },
    },
    status: {
      conditions: [],
      devicesSummary: {
        total: 0,
        applicationStatus: {},
        summaryStatus: {},
        updateStatus: {},
      },
    },
  },
  {
    apiVersion: API_VERSION,
    kind: 'Fleet',
    metadata: {
      creationTimestamp: '2024-04-10T12:13:58Z',
      generation: 1,
      labels: {},
      name: 'eu-west-prod-001',
      owner: 'ResourceSync/rs-west-fleet',
    },
    spec: {
      selector: {
        matchLabels: {
          fleet: 'eu-west-prod-001',
        },
      },
      template: {
        metadata: {
          generation: 1,
        },
        spec: {
          config: [
            {
              gitRef: {
                path: '/etc/microshift/manifests',
                targetRevision: 'main',
                repository: 'defaultRepo',
              },
              name: 'model-server',
            },
            {
              name: 'pull-secret',
              secretRef: {
                mountPath: '/etc/crio/pull-secret',
                name: 'device-pull-secret',
                namespace: 'devices',
              },
            },
          ],
          os: {
            image: 'quay.io/solar-farms/ai-inverter:1.5.0',
          },
          systemd: {
            matchPatterns: ['inverter.service', 'rs485-protocol.service'],
          },
        },
      },
    },
    status: {
      conditions: [],
      devicesSummary: {
        total: 0,
        applicationStatus: {},
        summaryStatus: {},
        updateStatus: {},
      },
    },
  },
];

export { basicFleets };
