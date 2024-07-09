import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import StatusCard from './Cards/Status/StatusCard';
import ToDoCard from './Cards/ToDo/ToDoCard';

const Overview = () => {
  return (
    <Grid hasGutter>
      <GridItem>
        <StatusCard />
      </GridItem>
      <GridItem span={4}>
        <ToDoCard />
      </GridItem>
    </Grid>
  );
};

export default Overview;
