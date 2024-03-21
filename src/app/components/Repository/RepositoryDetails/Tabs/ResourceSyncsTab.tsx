import * as React from 'react';
import { Card, CardBody, CardTitle, GridItem } from '@patternfly/react-core';

import WithHelperText from '@app/components/common/WithHelperText';
import RepositoryResourceSyncList from '@app/components/ResourceSync/RepositoryResourceSyncList';

const ResourceSyncsTab = ({ repositoryId }: { repositoryId: string }) => {
  return (
    <GridItem>
      <Card>
        <CardTitle>
          <WithHelperText popoverContent="Flight control will monitor the specified paths, import the defined fleets and synchronise devices">
            Resource syncs
          </WithHelperText>
        </CardTitle>
        <CardBody>
          <RepositoryResourceSyncList repositoryId={repositoryId} />
        </CardBody>
      </Card>
    </GridItem>
  );
};

export default ResourceSyncsTab;
