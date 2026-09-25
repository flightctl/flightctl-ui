import * as React from 'react';
import { CardBody, Label } from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/js/icons/cubes-icon';

import type { Device } from '@flightctl/types';
import type { DeviceHealthItem } from '../../../hooks/useDeviceOverallHealth';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppContext } from '../../../hooks/useAppContext';
import { getLifecycleDisabledReason } from '../../../utils/devices';
import { getDeviceAppLifecycleOverrides } from '../../../utils/applicationLifecycle';
import ApplicationsTable from '../../DetailsPage/Tables/ApplicationsTable';
import DetailsPageCard, { DetailsPageCardTitle } from '../../DetailsPage/DetailsPageCard';

type DeviceDetailsTabProps = {
  device: Required<Device>;
  health: DeviceHealthItem;
  refetch?: VoidFunction;
};

const DeviceApplications = ({ device, health, refetch = () => undefined }: DeviceDetailsTabProps) => {
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
    <DetailsPageCard id="device-applications-card" isCompact>
      <DetailsPageCardTitle
        title={t('Applications')}
        icon={<CubesIcon />}
        badge={
          health.level !== null && (
            <Label status={health.level}>{t('{{appCount}} need attention', { appCount: health.itemCount })}</Label>
          )
        }
      />
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
