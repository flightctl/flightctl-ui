import { ManagedCluster } from '../types/k8s';
import { getErrorMessage } from '@flightctl/ui-components/src/utils/error';

const isMicroShiftCluster = (mc: ManagedCluster) =>
  mc?.status?.clusterClaims?.some(
    (claim) =>
      claim.name === 'product.open-cluster-management.io' && (claim.value || '').toUpperCase() === 'MICROSHIFT',
  );

const getWatchK8sResourceResult = (error: string | object | undefined, accept404: boolean) => {
  if (error === undefined || typeof error === 'string') {
    return error;
  }
  if ('code' in error && error.code === 404 && accept404) {
    return undefined;
  }
  return getErrorMessage(error);
};

export { isMicroShiftCluster, getWatchK8sResourceResult };
