import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Device } from '@types';
import * as React from 'react';
import { useParams } from 'react-router';
import DetailsPage from '../../DetailsPage/DetailsPage';
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
import { getDateDisplay } from '@app/utils/dates';
import { useNavigate } from 'react-router-dom';
import SystemdTable from './SystemdTable';

import LabelsView from '@app/components/common/LabelsView';
import ConditionsTable from '@app/components/DetailsPage/Tables/ConditionsTable';
import ContainersTable from '@app/components/DetailsPage/Tables/ContainersTable';
import IntegrityTable from '@app/components/DetailsPage/Tables/IntegrityTable';
import DetailsPageCard, { DetailsPageCardBody } from '@app/components/DetailsPage/DetailsPageCard';
import DetailsPageActions, { useDeleteAction } from '@app/components/DetailsPage/DetailsPageActions';
import DeviceFleet from '@app/components/Device/DeviceDetails/DeviceFleet';
import { useFetch } from '@app/hooks/useFetch';
import { getDeviceFleet } from '@app/utils/devices';

const DeviceDetails = () => {
  const { deviceId } = useParams() as { deviceId: string };
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });
  const navigate = useNavigate();
  const { remove } = useFetch();

  const name = (device?.metadata.labels?.displayName || device?.metadata.name) as string;
  const boundFleet = getDeviceFleet(device?.metadata || {});

  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`devices/${deviceId}`);
      navigate('/devicemanagement/devices');
    },
    disabledReason: boundFleet ? 'Devices bound to a fleet cannot be deleted' : '',
    resourceName: name,
    resourceType: 'Device',
  });

  return (
    <DetailsPage
      loading={loading}
      error={error}
      id={deviceId}
      title={name}
      resourceLink="/devicemanagement/devices"
      resourceType="Devices"
      actions={
        <DetailsPageActions>
          <DropdownList>{deleteAction}</DropdownList>
        </DetailsPageActions>
      }
    >
      <Grid hasGutter>
        <GridItem md={12}>
          <Card>
            <CardTitle>Details</CardTitle>
            <CardBody>
              <DescriptionList columnModifier={{ lg: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>Fingerprint</DescriptionListTerm>
                  <DescriptionListDescription>{device?.metadata.name || '-'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Created</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getDateDisplay(device?.metadata.creationTimestamp)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Fleet</DescriptionListTerm>
                  <DescriptionListDescription>
                    <DeviceFleet deviceMetadata={device?.metadata || {}} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>OS</DescriptionListTerm>
                  <DescriptionListDescription>{device?.spec?.os?.image || '-'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Architecture</DescriptionListTerm>
                  <DescriptionListDescription>
                    {device?.status?.systemInfo?.architecture || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Labels</DescriptionListTerm>
                  <DescriptionListDescription>
                    <LabelsView labels={device?.metadata?.labels} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>Conditions</CardTitle>
            <DetailsPageCardBody>
              {device && <ConditionsTable type="Device" conditions={device.status.conditions} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>Systemd units</CardTitle>
            <DetailsPageCardBody>{device && <SystemdTable device={device} refetch={refetch} />}</DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>Containers</CardTitle>
            <DetailsPageCardBody>
              {device && <ContainersTable containers={device.status.containers} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>System integrity measurements</CardTitle>
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
