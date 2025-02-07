import * as React from 'react';
import {
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import DetailsPageCard, { DetailsPageCardBody } from '../../../DetailsPage/DetailsPageCard';
import FlightControlDescriptionList from '../../../common/FlightCtlDescriptionList';
import DeviceResourceStatus from '../../../Status/DeviceResourceStatus';

const SystemResourcesContent = ({ device }: { device: Required<Device> }) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <CardTitle>{t('Resource status')}</CardTitle>
      <DetailsPageCardBody>
        <FlightControlDescriptionList columnModifier={{ default: '3Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('CPU pressure')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceResourceStatus device={device} monitorType="cpu" />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Disk pressure')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceResourceStatus device={device} monitorType="disk" />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Memory pressure')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceResourceStatus device={device} monitorType="memory" />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </FlightControlDescriptionList>
      </DetailsPageCardBody>
    </DetailsPageCard>
  );
};

export default SystemResourcesContent;
