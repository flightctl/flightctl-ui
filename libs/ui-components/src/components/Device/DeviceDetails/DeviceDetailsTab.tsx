import * as React from 'react';
import {
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Stack,
  StackItem,
  gridSpans,
} from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { isDeviceEnrolled } from '../../../utils/devices';

import { useTranslation } from '../../../hooks/useTranslation';
import { useDeviceSpecSystemInfo } from '../../../hooks/useDeviceSpecSystemInfo';
import EditLabelsForm, { ViewLabels } from '../../modals/EditLabelsModal/EditLabelsForm';
import ResourceLink from '../../common/ResourceLink';
import LabelWithHelperText from '../../common/WithHelperText';
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
  const devSystemInfo = useDeviceSpecSystemInfo(device.status.systemInfo, t);
  const hasExtraColumn = !!children;

  return (
    <Grid hasGutter>
      <GridItem md={12}>
        <DetailsPageCard>
          <DetailsPageCardBody>
            <Grid>
              <GridItem md={6} lg={hasExtraColumn ? 2 : 3}>
                <Stack>
                  <StackItem className="fctl-device-details-tab__label">{t('Name')}</StackItem>
                  <StackItem>
                    <ResourceLink id={device.metadata.name || '-'} />
                  </StackItem>
                </Stack>
              </GridItem>
              {hasExtraColumn && (
                <GridItem md={6} lg={2}>
                  {children}
                </GridItem>
              )}
              <GridItem md={6} lg={hasExtraColumn ? 2 : 3}>
                <Stack>
                  <StackItem className="fctl-device-details-tab__label">{t('Fleet name')}</StackItem>
                  <StackItem>
                    <DeviceFleet device={device} />
                  </StackItem>
                </Stack>
              </GridItem>
              <GridItem md={12} lg={6}>
                <Stack>
                  <StackItem className="fctl-device-details-tab__label">{t('Labels')}</StackItem>
                  <StackItem>
                    {canEdit ? (
                      <EditLabelsForm device={device} onDeviceUpdate={refetch} />
                    ) : (
                      <ViewLabels device={device} />
                    )}
                  </StackItem>
                </Stack>
              </GridItem>
            </Grid>
            {devSystemInfo.baseInfo.length > 0 && (
              <Grid hasGutter>
                {devSystemInfo.baseInfo.map((systemInfo, index) => {
                  const sizes: gridSpans[] = hasExtraColumn ? [2, 2, 2, 6] : [3, 3, 6];
                  const colSize = sizes[index % (hasExtraColumn ? 4 : 3)];
                  return (
                    <GridItem md={6} lg={colSize} key={systemInfo.title}>
                      <Stack>
                        <StackItem className="fctl-device-details-tab__label">{systemInfo.title}</StackItem>
                        <StackItem>{systemInfo.value}</StackItem>
                      </Stack>
                    </GridItem>
                  );
                })}
              </Grid>
            )}
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      {devSystemInfo.customInfo.length > 0 && (
        <GridItem md={12} lg={6}>
          <DetailsPageCard>
            <CardTitle>{t('Custom data')}</CardTitle>
            <DetailsPageCardBody>
              <Grid hasGutter>
                {devSystemInfo.customInfo.map((systemInfo) => {
                  return (
                    <GridItem md={4} key={systemInfo.title}>
                      <Stack>
                        <StackItem className="fctl-device-details-tab__label">{systemInfo.title}</StackItem>
                        <StackItem>{systemInfo.value}</StackItem>
                      </Stack>
                    </GridItem>
                  );
                })}
              </Grid>
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
      )}
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
