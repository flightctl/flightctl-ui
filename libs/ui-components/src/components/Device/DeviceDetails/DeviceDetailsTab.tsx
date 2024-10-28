import * as React from 'react';
import {
  Alert,
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

import { Device, TemplateVersion } from '@flightctl/types';
import { timeSinceText } from '../../../utils/dates';
import ApplicationsTable from '../../DetailsPage/Tables/ApplicationsTable';
import DeviceStatus from '../../Status/DeviceStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import EditLabelsForm from '../../modals/EditLabelsModal/EditLabelsForm';
import ResourceLink from '../../common/ResourceLink';
import DeviceFleet from './DeviceFleet';
import DeviceOs from './DeviceOs';
import DetailsPageCard, { DetailsPageCardBody } from '../../DetailsPage/DetailsPageCard';
import SystemdTable from './SystemdTable';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import RepositorySourceList from '../../Repository/RepositoryDetails/RepositorySourceList';
import { getErrorMessage } from '../../../utils/error';
import ApplicationSummaryStatus from '../../Status/ApplicationSummaryStatus';
import WithHelperText from '../../common/WithHelperText';
import SystemUpdateStatus from '../../Status/SystemUpdateStatus';
import DeviceResourceStatus from '../../Status/DeviceResourceStatus';

import './DeviceDetailsTab.css';

type DeviceDetailsTabProps = {
  device: Required<Device>;
  refetch: VoidFunction;
  tv: TemplateVersion | undefined;
  errorTv: unknown;
};

const DeviceDetailsTab = ({
  device,
  refetch,
  tv,
  errorTv,
  children,
}: React.PropsWithChildren<DeviceDetailsTabProps>) => {
  const { t } = useTranslation();

  return (
    <Grid hasGutter>
      {!!errorTv && (
        <GridItem md={12}>
          <Alert isInline variant="warning" title={t('Some device details could not be loaded.')}>
            {getErrorMessage(errorTv)}
          </Alert>
        </GridItem>
      )}
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
                  <EditLabelsForm device={device} onDeviceUpdate={refetch} />
                </StackItem>
              </FlexItem>
            </Flex>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('System status')}</CardTitle>
          <DetailsPageCardBody>
            <FlightControlDescriptionList columnModifier={{ default: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  <WithHelperText
                    content={t('Indicates the overall status of application workloads on the device.')}
                    ariaLabel={t('Application status')}
                    showLabel
                  />
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <ApplicationSummaryStatus statusSummary={device.status?.applicationsSummary} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  <WithHelperText
                    content={t('Indicates the overall status of the device hardware and operating system.')}
                    ariaLabel={t('Device status')}
                    showLabel
                  />{' '}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <DeviceStatus deviceStatus={device.status} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  <WithHelperText
                    content={t(
                      'Indicates whether a system is running the latest target configuration or is updating towards it.',
                    )}
                    ariaLabel={t('Update status')}
                    showLabel
                  />
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <SystemUpdateStatus deviceStatus={device.status} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Last seen')}</DescriptionListTerm>
                <DescriptionListDescription>{timeSinceText(t, device.status.lastSeen)}</DescriptionListDescription>
              </DescriptionListGroup>
            </FlightControlDescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
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
        <DetailsPageCard>
          <CardTitle>{t('Applications')}</CardTitle>
          <DetailsPageCardBody>
            <ApplicationsTable appsStatus={device.status.applications} />
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('System services')}</CardTitle>
          <DetailsPageCardBody>
            <SystemdTable device={device} templateVersion={tv} onSystemdUnitsUpdate={refetch} />
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
    </Grid>
  );
};

export default DeviceDetailsTab;
