import * as React from 'react';
import {
  Bullseye,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import { type Device } from '@flightctl/types';
import { isDeviceEnrolled } from '../../../utils/devices';

import { useTranslation } from '../../../hooks/useTranslation';
import ResourceLink from '../../common/ResourceLink';
import LabelWithHelperText from '../../common/WithHelperText';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';
import DeviceLifecycleStatus from '../../Status/DeviceLifecycleStatus';
import ConfigurationsContent from './DeviceDetailsTabContent/ConfigurationsContent';
import DeviceOverviewLayout from './DeviceOverviewLayout';

import './DeviceDetailsTab.css';

type DeviceDetailsTabProps = {
  device: Required<Device>;
  refetch: VoidFunction;
  canEdit: boolean;
};

const EnrolledDeviceDetails = ({
  device,
  refetch,
  canEdit,
  children,
}: React.PropsWithChildren<DeviceDetailsTabProps>) => (
  <DeviceOverviewLayout device={device} refetch={refetch} canEdit={canEdit}>
    {children}
  </DeviceOverviewLayout>
);

const DecommissionedDeviceDetails = ({ device, children }: React.PropsWithChildren<{ device: Required<Device> }>) => {
  const { t } = useTranslation();

  return (
    <Grid hasGutter>
      <GridItem md={12}>
        <DetailsPageCard>
          <CardBody>
            <DescriptionList columnModifier={{ default: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceLink id={device.metadata.name || '-'} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  <LabelWithHelperText
                    label={t('Status')}
                    content={t(
                      'Indicates whether the device is available to be managed and assigned to do work or is moving to an end-of-life state.',
                    )}
                  />
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <DeviceLifecycleStatus device={device} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              {children}
            </DescriptionList>
          </CardBody>
        </DetailsPageCard>
      </GridItem>

      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('Configurations')}</CardTitle>
          <CardBody>
            <ConfigurationsContent device={device} />
          </CardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('Applications')}</CardTitle>
          <CardBody>
            <Bullseye>{t('Application status is not available for decommissioned devices')}</Bullseye>
          </CardBody>
        </DetailsPageCard>
      </GridItem>
    </Grid>
  );
};

const DeviceDetailsTab = ({ device, refetch, children, canEdit }: React.PropsWithChildren<DeviceDetailsTabProps>) => {
  const isEnrolled = isDeviceEnrolled(device);
  return isEnrolled ? (
    <EnrolledDeviceDetails device={device} refetch={refetch} canEdit={canEdit}>
      {children}
    </EnrolledDeviceDetails>
  ) : (
    <DecommissionedDeviceDetails device={device}>{children}</DecommissionedDeviceDetails>
  );
};

export default DeviceDetailsTab;
