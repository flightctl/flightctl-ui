import * as React from 'react';
import { CardBody, CardTitle, Flex, FlexItem } from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import SystemdUnitsTable from '../../DetailsPage/Tables/SystemdUnitsTable';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';

type DeviceSystemdUnitsProps = {
  device: Required<Device>;
};

const DeviceSystemdUnits = ({ device }: DeviceSystemdUnitsProps) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <CardTitle>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>{t('System services')}</FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <SystemdUnitsTable systemdUnitsStatus={device.status.systemd || []} />
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceSystemdUnits;
