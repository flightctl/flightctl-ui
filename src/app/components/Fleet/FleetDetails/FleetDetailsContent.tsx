import LabelsView from '@app/components/common/LabelsView';
import { getDateDisplay } from '@app/utils/dates';
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
  Spinner,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';

import SourceUrlList from '../SourceUrlList';
import { Fleet } from '@types';
import { getSourceUrls } from '@app/utils/fleets';
import FleetOwnerLink from '@app/components/Fleet/FleetDetails/FleetOwnerLink';
import FleetStatus from '../FleetStatus';

const FleetDevices = ({ fleetId, count }: { fleetId: string; count: number | undefined }) => {
  if (count === undefined) {
    return <Spinner size="sm" />;
  }
  if (count === 0) {
    return <>0</>;
  }
  return <Link to={`/devicemanagement/devices?fleetId=${fleetId}`}>{count}</Link>;
};

const FleetDetailsContent = ({ fleet, devicesCount }: { fleet: Fleet; devicesCount: number | undefined }) => {
  return (
    <Grid hasGutter>
      <GridItem md={12}>
        <Card>
          <CardTitle>Details</CardTitle>
          <CardBody>
            <DescriptionList columnModifier={{ lg: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>OS image</DescriptionListTerm>
                <DescriptionListDescription>{fleet.spec.template.spec.os?.image}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Label selector</DescriptionListTerm>
                <DescriptionListDescription>
                  <LabelsView prefix="device" labels={fleet.spec.selector?.matchLabels} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Associated devices</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetDevices fleetId={fleet.metadata.name as string} count={devicesCount} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Managed by</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetOwnerLink owner={fleet.metadata.owner} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetStatus fleet={fleet} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Sources</DescriptionListTerm>
                <DescriptionListDescription>
                  <SourceUrlList sourceUrls={getSourceUrls(fleet)} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Created</DescriptionListTerm>
                <DescriptionListDescription>
                  {getDateDisplay(fleet.metadata.creationTimestamp || '')}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default FleetDetailsContent;
