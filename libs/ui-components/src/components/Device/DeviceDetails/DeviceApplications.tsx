import * as React from 'react';
import { CardBody, CardTitle } from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppContext } from '../../../hooks/useAppContext';
import { getLifecycleDisabledReason } from '../../../utils/devices';
import { getDeviceAppLifecycleOverrides } from '../../../utils/applicationLifecycle';
import ApplicationsTable from '../../DetailsPage/Tables/ApplicationsTable';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';

type DeviceDetailsTabProps = {
  device: Required<Device>;
  refetch?: VoidFunction;
};

const DeviceApplications = ({ device, refetch = () => undefined }: DeviceDetailsTabProps) => {
  const { t } = useTranslation();
  const {
    router: { useNavigate: useRouterNavigate },
  } = useAppContext();
  const routerNavigate = useRouterNavigate();

  const lifecycleDisabledReason = getLifecycleDisabledReason(device, t);
  const deviceAppLifecycleOverrides = getDeviceAppLifecycleOverrides(device.metadata.annotations ?? {});

  const handleOpenConsole = React.useCallback(
    (name: string) => {
      routerNavigate(`../terminal?console=${encodeURIComponent(name)}`);
    },
    [routerNavigate],
  );

  return (
    <DetailsPageCard isCompact>
      <CardTitle>{t('Applications')}</CardTitle>
      <CardBody>
        <ApplicationsTable
          deviceName={device.metadata.name as string}
          refetch={refetch}
          lifecycleDisabledReason={lifecycleDisabledReason}
          deviceAppLifecycleOverrides={deviceAppLifecycleOverrides}
          appsStatus={device.status.applications}
          appsSpecs={device.spec.applications}
          onOpenConsole={handleOpenConsole}
        />
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceApplications;
