import * as React from 'react';
import {
  Alert,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DropdownList,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { getDateDisplay } from '../../../utils/dates';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useFetch } from '../../../hooks/useFetch';
import ApplicationsTable from '../../DetailsPage/Tables/ApplicationsTable';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import DeviceStatus from '../../Status/DeviceStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import EditLabelsForm from '../../modals/EditLabelsModal/EditLabelsForm';
import ResourceLink from '../../common/ResourceLink';
import DeviceFleet from './DeviceFleet';
import DetailsPageCard, { DetailsPageCardBody } from '../../DetailsPage/DetailsPageCard';
import SystemdTable from './SystemdTable';
import RepositorySourceList from '../../Repository/RepositoryDetails/RepositorySourceList';
import { getSourceItems } from '../../../utils/devices';
import { useTemplateVersion } from '../../../hooks/useTemplateVersion';
import { getErrorMessage } from '../../../utils/error';
import ApplicationSummaryStatus from '../../Status/ApplicationSummaryStatus';
import WithHelperText from '../../common/WithHelperText';
import SystemUpdateStatus from '../../Status/SystemUpdateStatus';
import DeviceResourceStatus from '../../Status/DeviceResourceStatus';

const DeviceDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });
  const [, /* useTv */ tv, loadingTv, errorTv] = useTemplateVersion(device);

  const navigate = useNavigate();
  const { remove } = useFetch();

  const name = (device?.metadata.labels?.displayName || device?.metadata.name) as string;

  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`devices/${deviceId}`);
      navigate(ROUTE.DEVICES);
    },
    resourceName: name,
    resourceType: 'Device',
  });

  const sourceItems = getSourceItems(device?.spec.config);
  return (
    <DetailsPage
      loading={loading || loadingTv}
      error={error}
      id={deviceId}
      title={name}
      resourceLink={ROUTE.DEVICES}
      resourceType="Devices"
      resourceTypeLabel={t('Devices')}
      actions={
        <DetailsPageActions>
          <DropdownList>{deleteAction}</DropdownList>
        </DetailsPageActions>
      }
    >
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
                  <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getDateDisplay(device?.metadata.creationTimestamp)}
                  </DescriptionListDescription>
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
      {deleteModal}
    </DetailsPage>
  );
};

export default DeviceDetails;
