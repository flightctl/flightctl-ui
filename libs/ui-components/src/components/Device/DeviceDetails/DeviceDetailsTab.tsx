import * as React from 'react';
import {
  Alert,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import { Device, TemplateVersion } from '@flightctl/types';
import { timeSinceText } from '../../../utils/dates';
import ApplicationsTable from '../../DetailsPage/Tables/ApplicationsTable';
import DeviceStatus from '../../Status/DeviceStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import EditLabelsForm from '../../modals/EditLabelsModal/EditLabelsForm';
import ResourceLink from '../../common/ResourceLink';
import DeviceFleet from './DeviceFleet';
import DetailsPageCard, { DetailsPageCardBody } from '../../DetailsPage/DetailsPageCard';
import SystemdTable from './SystemdTable';
import RepositorySourceList from '../../Repository/RepositoryDetails/RepositorySourceList';
import { getSourceItems } from '../../../utils/devices';
import { getErrorMessage } from '../../../utils/error';
import ApplicationSummaryStatus from '../../Status/ApplicationSummaryStatus';
import WithHelperText from '../../common/WithHelperText';
import SystemUpdateStatus from '../../Status/SystemUpdateStatus';
import DeviceResourceStatus from '../../Status/DeviceResourceStatus';

const DeviceDetailsTab = ({
  device,
  refetch,
  tv,
  errorTv,
}: {
  device: Required<Device>;
  refetch: VoidFunction;
  tv: TemplateVersion | undefined;
  errorTv: unknown;
}) => {
  const { t } = useTranslation();

  const sourceItems = getSourceItems(device.spec.config);
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
            <DescriptionList isAutoColumnWidths columnModifier={{ default: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Fingerprint')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceLink id={device?.metadata.name || '-'} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              {device && <EditLabelsForm device={device} onDeviceUpdate={refetch} />}
            </DescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('System status')}</CardTitle>
          <DetailsPageCardBody>
            <DescriptionList columnModifier={{ default: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  <WithHelperText
                    content={t('Indicates the overall status of application workloads on the device.')}
                    ariaLabel={t('Application status')}
                    showLabel
                  />
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <ApplicationSummaryStatus statusSummary={device?.status?.applications.summary} />
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
                  <DeviceStatus deviceStatus={device?.status} />
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
                  <SystemUpdateStatus updateStatus={device?.status?.updated} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Last seen')}</DescriptionListTerm>
                <DescriptionListDescription>{timeSinceText(t, device?.status.updatedAt)}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('Resource status')}</CardTitle>
          <DetailsPageCardBody>
            <DescriptionList columnModifier={{ default: '3Col' }}>
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
            </DescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('Configurations')}</CardTitle>
          <DetailsPageCardBody>
            <DescriptionList columnModifier={{ default: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('System image')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {tv?.status?.os?.image || device?.status?.systemInfo?.operatingSystem || '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Fleet name')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <DeviceFleet deviceMetadata={device?.metadata || {}} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Sources ({{size}})', { size: sourceItems.length })}</DescriptionListTerm>
                <DescriptionListDescription>
                  <RepositorySourceList sourceItems={sourceItems} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('Applications')}</CardTitle>
          <DetailsPageCardBody>
            {device && <ApplicationsTable appsStatus={device.status.applications} />}
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
      <GridItem md={12} lg={6}>
        <DetailsPageCard>
          <CardTitle>{t('System services')}</CardTitle>
          <DetailsPageCardBody>
            {device && <SystemdTable device={device} templateVersion={tv} onSystemdUnitsUpdate={refetch} />}
          </DetailsPageCardBody>
        </DetailsPageCard>
      </GridItem>
    </Grid>
  );
};

export default DeviceDetailsTab;
