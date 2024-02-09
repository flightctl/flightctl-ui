import React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { Fleet } from '@types';
import { getDateDisplay } from '@app/utils/dateUtils';
import { getSourceUrls } from '@app/utils/fleetUtils';
import FleetServiceStatus from '@app/components/Metrics/FleetServiceStatus';

import SourceUrlList from './SourceUrlList';

const FleetDetailsContent = ({ fleet }: { fleet: Required<Fleet> }) => {
  const sourceUrls = getSourceUrls(fleet);
  return (
    <Grid hasGutter>
      <GridItem md={6}>
        <Card>
          <CardTitle>Details</CardTitle>
          <CardBody>
            <Flex>
              <FlexItem>
                <DescriptionList>
                  <DescriptionListTerm>Created</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getDateDisplay(fleet.metadata.creationTimestamp || '')}
                  </DescriptionListDescription>
                </DescriptionList>
              </FlexItem>
              <FlexItem>
                <DescriptionList>
                  <DescriptionListTerm>Sources ({sourceUrls.length})</DescriptionListTerm>
                  <DescriptionListDescription>
                    <SourceUrlList sourceUrls={sourceUrls} />
                  </DescriptionListDescription>
                </DescriptionList>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem md={6}>
        <Card>
          <CardTitle>Service status</CardTitle>
          <CardBody>
            <FleetServiceStatus />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem md={6}>
        <Card>
          <CardTitle>Events</CardTitle>
          <CardBody>some events go here</CardBody>
        </Card>
      </GridItem>
      <GridItem md={6}>
        <Card>
          <CardTitle>Update status</CardTitle>
          <CardBody>
            <div style={{ fontSize: 30 }}>TBD</div>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default FleetDetailsContent;
