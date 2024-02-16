import React from 'react';
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
  Label,
} from '@patternfly/react-core';
import { CheckCircleIcon, InProgressIcon, QuestionCircleIcon } from '@patternfly/react-icons';

import { Fleet, FleetStatus } from '@types';
import { getDateDisplay } from '@app/utils/dateUtils';
import { getFleetStatusType, getSourceUrls } from '@app/utils/fleetUtils';

import { DevicesDonuts } from '@app/old/Overview/devicesDonuts';
import EventList from '@app/components/common/EventList';
import FleetServiceStatus from '@app/components/Metrics/FleetServiceStatus';

import SourceUrlList from './SourceUrlList';

const fakeDevicesStatus = {
  Ready: { count: 720 },
  Error: { count: 50 },
  Syncing: { count: 80 },
  Offline: { count: 90 },
  Degraded: { count: 60 },
};

const FleetStatus = ({ status }: { status: FleetStatus }) => {
  const statusType = getFleetStatusType(status);
  let color;
  let icon;

  switch (statusType) {
    case 'Syncing':
      color = 'orange';
      icon = <InProgressIcon />;
      break;
    case 'Synced':
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    default:
      color = 'grey';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <Label color={color} icon={icon}>
      {statusType}
    </Label>
  );
};

const FleetDetailsContent = ({ fleet }: { fleet: Required<Fleet> }) => {
  const sourceUrls = getSourceUrls(fleet);

  return (
    <Grid hasGutter>
      <GridItem md={6}>
        <Card>
          <CardTitle>Details</CardTitle>
          <CardBody>
            <DescriptionList columnModifier={{ lg: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>Created</DescriptionListTerm>
                <DescriptionListDescription>
                  {getDateDisplay(fleet.metadata.creationTimestamp || '')}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Created by</DescriptionListTerm>
                <DescriptionListDescription>user unknown</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetStatus status={fleet.status} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Fail threshold</DescriptionListTerm>
                <DescriptionListDescription>20% of batch (m)</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Batch size</DescriptionListTerm>
                <DescriptionListDescription>10% (m)</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Maintenance window</DescriptionListTerm>
                <DescriptionListDescription>--</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Sources</DescriptionListTerm>
                <DescriptionListDescription>
                  <SourceUrlList sourceUrls={sourceUrls} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem md={6}>
        <Card>
          <CardTitle>Service status (m)</CardTitle>
          <CardBody>
            <FleetServiceStatus />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem md={6}>
        <Card>
          <CardTitle>Events (m)</CardTitle>
          <CardBody>
            <EventList />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem md={6}>
        <Card>
          <CardTitle>Update status (m)</CardTitle>
          <CardBody>
            <DevicesDonuts fleetDevicesStatus={fakeDevicesStatus} totalDevices={1000}></DevicesDonuts>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default FleetDetailsContent;
