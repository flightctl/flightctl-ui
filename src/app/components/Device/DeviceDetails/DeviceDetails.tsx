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
import ContainersTable from './ContainersTable';
import SystemdTable from './SystemdTable';
import ConditionsTable from './ConditionsTable';
import IntegrityTable from './IntegrityTable';

import './DeviceDetails.css';
import LabelsView from '@app/components/common/LabelsView';

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
          <Card className="fctl-device-details__card">
            <CardTitle>Conditions</CardTitle>
            <CardBody className="fctl-device-details__card-body">
              {device && <ConditionsTable device={device} />}
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={6}>
          <Card className="fctl-device-details__card">
            <CardTitle>Systemd units</CardTitle>
            <CardBody className="fctl-device-details__card-body">
              {device && <SystemdTable device={device} refetch={refetch} />}
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={6}>
          <Card className="fctl-device-details__card">
            <CardTitle>Containers</CardTitle>
            <CardBody className="fctl-device-details__card-body">
              {device && <ContainersTable device={device} />}
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={6}>
          <Card className="fctl-device-details__card">
            <CardTitle>System integrity measurements</CardTitle>
            <CardBody className="fctl-device-details__card-body">
              {device && <IntegrityTable device={device} />}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </DetailsPage>
  );
};

export default DeviceDetails;
