import { ConditionStatus, ConditionType, Fleet } from '@flightctl/types';

const basicFleets: Fleet[] = [
  {
    apiVersion: 'v1alpha1',
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
              configType: 'GitConfigProviderSpec',
              gitRef: {
                path: '/demos/inverter-fleet/configuration/',
                repository: 'defaultRepo',
                targetRevision: 'main',
              },
              name: 'example-server',
            },
          ],
          containers: {
            matchPatterns: ['*ai-optimizer-model-server*', '*web-interface*', '*control-loop*'],
          },
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
    },
  },
  {
    apiVersion: 'v1alpha1',
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
              configType: 'GitConfigProviderSpec',
              gitRef: {
                path: '/etc/microshift/manifests',
                targetRevision: 'main',
                repository: 'defaultRepo',
              },
              name: 'model-server',
            },
            {
              name: 'pull-secret',
              configType: 'KubernetesSecretProviderSpec',
              secretRef: {
                mountPath: '/etc/crio/pull-secret',
                name: 'device-pull-secret',
                namespace: 'devices',
              },
            },
          ],
          containers: {
            matchPatterns: ['*ai-optimizer-model-server*', '*web-interface*', '*control-loop*'],
          },
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
    },
  },
];

export { basicFleets };
