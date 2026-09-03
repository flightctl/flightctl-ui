import * as React from 'react';
import { CardBody } from '@patternfly/react-core';
import CogIcon from '@patternfly/react-icons/dist/js/icons/cog-icon';

import { type Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import SystemdUnitsTable from '../../DetailsPage/Tables/SystemdUnitsTable';
import DetailsPageCard, { DetailsPageCardTitle } from '../../DetailsPage/DetailsPageCard';

type DeviceSystemdUnitsProps = {
  device: Required<Device>;
};

const DeviceSystemdUnits = ({ device }: DeviceSystemdUnitsProps) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <DetailsPageCardTitle title={t('System services')} icon={<CogIcon />} />
      <CardBody>
        <SystemdUnitsTable systemdUnitsStatus={device.status.systemd || []} />
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceSystemdUnits;
