import * as React from 'react';
import { CardBody, CardTitle, Flex, FlexItem } from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import ApplicationsTable from '../../DetailsPage/Tables/ApplicationsTable';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';

type DeviceDetailsTabProps = {
  device: Required<Device>;
};

const DeviceApplications = ({ device }: DeviceDetailsTabProps) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <CardTitle>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>{t('Applications')}</FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <ApplicationsTable appsStatus={device.status.applications} />
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceApplications;
