import * as React from 'react';
import {
  Card,
  CardBody,
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
import ConditionsTable from '../../DetailsPage/Tables/ConditionsTable';
import ContainersTable from '../../DetailsPage/Tables/ContainersTable';
import IntegrityTable from '../../DetailsPage/Tables/IntegrityTable';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageCard, { DetailsPageCardBody } from '../../DetailsPage/DetailsPageCard';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import DeviceFleet from './DeviceFleet';
import DeviceStatus from './DeviceStatus';
import SystemdTable from './SystemdTable';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import EditLabelsForm from '../../modals/EditLabelsModal/EditLabelsForm';

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
          <Card>
            <CardTitle>{t('Details')}</CardTitle>
            <CardBody>
              <DescriptionList columnModifier={{ lg: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Fingerprint')}</DescriptionListTerm>
                  <DescriptionListDescription>{device?.metadata.name || '-'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getDateDisplay(device?.metadata.creationTimestamp)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Fleet')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <DeviceFleet deviceMetadata={device?.metadata || {}} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <DeviceStatus device={device} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('OS')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {device?.status?.systemInfo?.operatingSystem || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Architecture')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {device?.status?.systemInfo?.architecture || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {device && <EditLabelsForm device={device} onDeviceUpdate={refetch} />}
              </DescriptionList>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('Conditions')}</CardTitle>
            <DetailsPageCardBody>
              {device && (
                <ConditionsTable ariaLabel={t('Device conditions table')} conditions={device.status.conditions} />
              )}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('Systemd units')}</CardTitle>
            <DetailsPageCardBody>
              {device && <SystemdTable device={device} onSystemdUnitsUpdate={refetch} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('Containers')}</CardTitle>
            <DetailsPageCardBody>
              {device && <ContainersTable containers={device.status.containers} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('System integrity measurements')}</CardTitle>
            <DetailsPageCardBody>
              {device && <IntegrityTable measurements={device.status.systemInfo?.measurements} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
      </Grid>
      {deleteModal}
    </DetailsPage>
  );
};

export default DeviceDetails;
