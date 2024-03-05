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
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { getDateDisplay } from '@app/utils/dates';
import SystemdTable from './SystemdTable';

import LabelsView from '@app/components/common/LabelsView';
import ConditionsTable from '@app/components/DetailsPage/ConditionsTable';
import ContainersTable from '@app/components/DetailsPage/ContainersTable';
import IntegrityTable from '@app/components/DetailsPage/IntegrityTable';
import DetailsPageCard, { DetailsPageCardBody } from '@app/components/DetailsPage/DetailsPageCard';

const DeviceDetails = () => {
  const { deviceId } = useParams() as { deviceId: string };
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });

  const name = device?.metadata.labels?.displayName || device?.metadata.name;

  return (
    <DetailsPage
      loading={loading}
      error={error}
      title={name}
      resourceLink="/devicemanagement/devices"
      resourceName="Devices"
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
                  <DescriptionListTerm>OS</DescriptionListTerm>
                  <DescriptionListDescription>
                    {device?.status.systemInfo?.operatingSystem || '-'}
                  </DescriptionListDescription>
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
              {device && <ConditionsTable conditions={device.status.conditions} />}
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
    </DetailsPage>
  );
};

export default DeviceDetails;
