import * as React from 'react';
import DeviceDetails from '@flightctl/ui-components/src/components/Device/DeviceDetails/DeviceDetails';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useAppContext } from '@flightctl/ui-components/src/hooks/useAppContext';
import {
  Alert,
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { getDisplayName } from '@flightctl/ui-components/src/components/common/DisplayName';
import { ManagedCluster } from '../../types/k8s';

import './DeviceDetailsPage.css';

const isMicroShiftCluster = (mc: ManagedCluster) =>
  mc?.status?.clusterClaims?.some(
    (claim) =>
      claim.name === 'product.open-cluster-management.io' && (claim.value || '').toUpperCase() === 'MICROSHIFT',
  );

const DeviceDetailsPage = () => {
  const { t } = useTranslation();
  const {
    router: { useParams, Link },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [mc, loaded, error] = useK8sWatchResource<ManagedCluster>({
    groupVersionKind: {
      kind: 'ManagedCluster',
      group: 'cluster.open-cluster-management.io',
      version: 'v1',
    },
    name: deviceId,
  });

  let mcContent: React.ReactNode = <Spinner size="sm" />;
  if (error) {
    mcContent = <Alert isInline title={error as string} />;
  } else if (loaded && mc) {
    const displayText = getDisplayName(mc.metadata?.name);
    mcContent = isMicroShiftCluster(mc) ? (
      <Button variant="plain" className="fctl-device-details__mc-btn">
        <Link to={`/multicloud/infrastructure/clusters/details/${mc.metadata?.name}/${mc.metadata?.name}`}>
          {displayText}
        </Link>
      </Button>
    ) : (
      '-'
    );
  }
  return (
    <DeviceDetails>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('MicroShift cluster')}</DescriptionListTerm>
        <DescriptionListDescription>{mcContent}</DescriptionListDescription>
      </DescriptionListGroup>
    </DeviceDetails>
  );
};

export default DeviceDetailsPage;
