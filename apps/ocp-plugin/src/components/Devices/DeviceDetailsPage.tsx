import * as React from 'react';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { Icon, Popover, Stack, StackItem } from '@patternfly/react-core';
import { useAppContext } from '@flightctl/ui-components/src/hooks/useAppContext';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import DeviceDetails from '@flightctl/ui-components/src/components/Device/DeviceDetails/DeviceDetailsPage';
import WithTooltip from '@flightctl/ui-components/src/components/common/WithTooltip';
import { getWatchK8sResourceResult, isMicroShiftCluster } from '../../utils/clusters';
import { ManagedCluster } from '../../types/k8s';

type K8sWatchResourceError = string | object;

const DeviceDetailsPage = () => {
  const { t } = useTranslation();
  const {
    router: { useParams, Link },
  } = useAppContext();
  const { deviceId: clusterName } = useParams() as { deviceId: string };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [mc, loaded, k8sError] = useK8sWatchResource<ManagedCluster>({
    groupVersionKind: {
      kind: 'ManagedCluster',
      group: 'cluster.open-cluster-management.io',
      version: 'v1',
    },
    name: clusterName,
  });

  const watchResultError = getWatchK8sResourceResult(k8sError as K8sWatchResourceError, true);
  if (!loaded || (k8sError && !watchResultError)) {
    return <DeviceDetails />;
  }

  let mcContent: React.ReactNode;
  if (watchResultError) {
    mcContent = (
      <Popover
        aria-label={t('The cluster details failed to load')}
        headerContent={t('The cluster details failed to load')}
        bodyContent={watchResultError}
      >
        <>
          <Icon size="sm" status="danger">
            <ExclamationCircleIcon />
          </Icon>{' '}
          {t('Failed to load')}
        </>
      </Popover>
    );
  } else if (loaded && mc) {
    mcContent = isMicroShiftCluster(mc) ? (
      <Stack>
        <StackItem className="fctl-device-details-tab__label">{t('MicroShift cluster')}</StackItem>
        <StackItem>
          <WithTooltip content={clusterName} showTooltip>
            <Link to={`/multicloud/infrastructure/clusters/details/${clusterName}/${clusterName}`}>{t('View')}</Link>
          </WithTooltip>
        </StackItem>
      </Stack>
    ) : (
      '-'
    );
  }
  return (
    <DeviceDetails>
      <Stack>
        <StackItem className="fctl-device-details-tab__label">{t('MicroShift cluster')}</StackItem>
        <StackItem>{mcContent}</StackItem>
      </Stack>
    </DeviceDetails>
  );
};

export default DeviceDetailsPage;
