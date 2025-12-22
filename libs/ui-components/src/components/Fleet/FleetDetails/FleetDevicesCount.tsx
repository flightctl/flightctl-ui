import React from 'react';
import { DevicesSummary } from '@flightctl/types';
import { Icon, Popover } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { Link, ROUTE } from '../../../hooks/useNavigate';
import { useTranslation } from '../../../hooks/useTranslation';

type FleetDevicesCountProps = {
  fleetId: string;
  devicesSummary: DevicesSummary | undefined;
  error?: string;
};

const UpdatedFleetDevices = ({ error }: { error?: string }) => {
  const { t } = useTranslation();
  if (!error) {
    return null;
  }

  return (
    <Popover
      aria-label={t('Fleet devices popover')}
      headerContent={t('Rollout error')}
      bodyContent={error}
      hasAutoWidth={false}
    >
      <Icon status="danger">
        <ExclamationCircleIcon />
      </Icon>
    </Popover>
  );
};

const FleetDevicesCount = ({ fleetId, devicesSummary, error }: FleetDevicesCountProps) => {
  if (!devicesSummary || !devicesSummary.total) {
    return <>0/0</>;
  }

  const upToDate = devicesSummary.updateStatus['UpToDate'];
  return (
    <>
      {/* Devices may continue updating even after a rollout failed. If all devices are up-to-date, do not show the rollout error */}
      {upToDate !== devicesSummary.total && <UpdatedFleetDevices error={error} />}
      {`${upToDate || 0}`}/
      <Link to={ROUTE.DEVICES} query={`fleetId=${fleetId}`}>
        {devicesSummary.total}
      </Link>
    </>
  );
};

export default FleetDevicesCount;
