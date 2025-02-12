import * as React from 'react';
import {
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { isDeviceEnrolled } from '../../../utils/devices';
import { timeSinceText } from '../../../utils/dates';

import { useTranslation } from '../../../hooks/useTranslation';
import EditLabelsForm, { ViewLabels } from '../../modals/EditLabelsModal/EditLabelsForm';
import ResourceLink from '../../common/ResourceLink';
import WithHelperText from '../../common/WithHelperText';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import DetailsPageCard, { DetailsPageCardBody } from '../../DetailsPage/DetailsPageCard';
import RepositorySourceList from '../../Repository/RepositoryDetails/RepositorySourceList';
import DeviceLifecycleStatus from '../../Status/DeviceLifecycleStatus';
import DeviceFleet from './DeviceFleet';
import DeviceOs from './DeviceOs';
import DeviceApplications from './DeviceApplications';
import StatusContent from './DeviceDetailsTabContent/StatusContent';
import SystemResourcesContent from './DeviceDetailsTabContent/SystemResourcesContent';

import './DeviceDetailsTab.css';

type DeviceDetailsTabProps = {
  device: Required<Device>;
  refetch: VoidFunction;
  canEdit: boolean;
};

const EnrolledDeviceDetails = ({
  device,
  refetch,
  children,
  canEdit,
}: React.PropsWithChildren<DeviceDetailsTabProps>) => {
  const { t } = useTranslation();
  return (
    <Grid hasGutter>
      <GridItem md={12}>
        <DetailsPageCard>
          <DetailsPageCardBody>
            <Flex alignItems={{ default: 'alignItemsFlexStart' }}>
              <FlexItem flex={{ default: 'flex_1' }}>
                <Stack>
                  <StackItem className="fctl-device-details-tab__label">{t('Name')}</StackItem>
                </Stack>
                <StackItem>
                  <ResourceLink id={device.metadata.name || '-'} />
                </StackItem>
              </FlexItem>
              {!!children && <FlexItem flex={{ default: 'flex_1' }}>{children}</FlexItem>}
              <FlexItem flex={{ default: 'flex_1' }}>
                <Stack>
                  <StackItem className="fctl-device-details-tab__label">{t('Fleet name')}</StackItem>
                  <StackItem>
                    <DeviceFleet device={device} />
                  </StackItem>
                </Stack>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_4' }}>
                <Stack>
                  <StackItem className="fctl-device-details-tab__label">{t('Labels')}</StackItem>
                </Stack>
                <StackItem>
                  {canEdit ? (
                    <EditLabelsForm device={device} onDeviceUpdate={refetch} />
                  ) : (
                    <ViewLabels device={device} />
                  )}
                </StackItem>
              </FlexItem>
            </Flex>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <StatusContent device={device} />
      </GridItem>
      <GridItem md={12} lg={6}>
        <SystemResourcesContent device={device} />
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('Configurations')}</CardTitle>
          <DetailsPageCardBody>
            <FlightControlDescriptionList columnModifier={{ default: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('System image (running)')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <DeviceOs desiredOsImage={device.spec?.os?.image} renderedOsImage={device.status?.os?.image} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {t('Sources ({{size}})', { size: device.spec?.config?.length || 0 })}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <RepositorySourceList configs={device.spec.config || []} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </FlightControlDescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DeviceApplications device={device} refetch={refetch} canEdit={canEdit} />
      </GridItem>
    </Grid>
  );
};

const DecommissionedDeviceDetails = ({ device, children }: React.PropsWithChildren<{ device: Required<Device> }>) => {
  const { t } = useTranslation();

  return (
    <Grid hasGutter>
      <GridItem md={12}>
        <DetailsPageCard>
          <DetailsPageCardBody>
            <FlightControlDescriptionList columnModifier={{ default: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceLink id={device.metadata.name || '-'} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  <WithHelperText
                    content={t(
                      'Indicates whether the device is available to be managed and assigned to do work or is moving to an end-of-life state.',
                    )}
                    ariaLabel={t('Status')}
                    showLabel
                  />
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <DeviceLifecycleStatus device={device} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Last seen')}</DescriptionListTerm>
                <DescriptionListDescription>{timeSinceText(t, device.status.lastSeen)}</DescriptionListDescription>
              </DescriptionListGroup>
              {children}
            </FlightControlDescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>

      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('Configurations')}</CardTitle>
          <DetailsPageCardBody>
            <FlightControlDescriptionList columnModifier={{ default: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('System image (running)')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <DeviceOs desiredOsImage={device.spec?.os?.image} renderedOsImage={device.status?.os?.image} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {t('Sources ({{size}})', { size: device.spec?.config?.length || 0 })}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <RepositorySourceList configs={device.spec.config || []} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </FlightControlDescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DeviceApplications device={device} canEdit={false} />
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
