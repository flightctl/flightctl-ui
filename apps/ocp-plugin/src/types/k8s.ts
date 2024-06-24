import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type ManagedCluster = K8sResourceCommon & {
  status?: {
    clusterClaims?: {
      name?: string;
      value?: string;
    }[];
  };
};
