import * as React from 'react';
import {
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
import DeviceStatus from './DeviceStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import EditLabelsForm from '../../modals/EditLabelsModal/EditLabelsForm';
import DisplayName from '../../common/DisplayName';
import DeviceFleet from './DeviceFleet';
import DetailsPageCard, { DetailsPageCardBody, DetailsPageCardTitle } from '../../DetailsPage/DetailsPageCard';
import SystemdTable from './SystemdTable';

const DeviceDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });

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

  return (
    <DetailsPage
      loading={loading}
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
        <GridItem md={12}>
          <DetailsPageCard>
            <DetailsPageCardBody>
              <DescriptionList isAutoColumnWidths columnModifier={{ default: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Fingerprint')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <DisplayName name={device?.metadata.name || '-'} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {device && <EditLabelsForm device={device} onDeviceUpdate={refetch} />}
              </DescriptionList>
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <DetailsPageCardTitle title={t('System status')} />
            <DetailsPageCardBody>
              <DescriptionList columnModifier={{ default: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Device status')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <DeviceStatus device={device} />
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
        <GridItem md={6}>
          <DetailsPageCard>
            <DetailsPageCardTitle title={t('Configurations')} />
            <DetailsPageCardBody>
              <DescriptionList columnModifier={{ default: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('System image')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {device?.status?.systemInfo?.operatingSystem || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Source name')}</DescriptionListTerm>
                  <DescriptionListDescription>TODO</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Fleet name')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <DeviceFleet deviceMetadata={device?.metadata || {}} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('Applications')}</CardTitle>
            <DetailsPageCardBody>
              {device && <ApplicationsTable containers={device.status.containers} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('System services')}</CardTitle>
            <DetailsPageCardBody>
              {device && <SystemdTable device={device} onSystemdUnitsUpdate={refetch} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
      </Grid>
      {deleteModal}
    </DetailsPage>
  );
};

export default DeviceDetails;
