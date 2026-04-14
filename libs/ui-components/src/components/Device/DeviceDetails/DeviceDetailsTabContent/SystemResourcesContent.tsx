import * as React from 'react';
import {
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import DetailsPageCard from '../../../DetailsPage/DetailsPageCard';
import DeviceResourceStatus, { MonitorType } from '../../../Status/DeviceResourceStatus';

const SystemResourcesContent = ({ device }: { device: Required<Device> }) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <CardTitle>{t('Resource status')}</CardTitle>
      <CardBody>
        <DescriptionList columnModifier={{ default: '3Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('CPU pressure')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceResourceStatus device={device} monitorType={MonitorType.cpu} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Disk pressure')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceResourceStatus device={device} monitorType={MonitorType.disk} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Memory pressure')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceResourceStatus device={device} monitorType={MonitorType.memory} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </DetailsPageCard>
  );
};

export default SystemResourcesContent;
