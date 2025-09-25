import * as React from 'react';
import ResourceSyncToRepository from '@flightctl/ui-components/src/components/ResourceSync/ResourceSyncToRepository';
import WithPageLayout from '../common/WithPageLayout';

const ResourceSyncToRepositoryPage = () => {
  return (
    <WithPageLayout>
      <ResourceSyncToRepository />
    </WithPageLayout>
  );
};

export default ResourceSyncToRepositoryPage;
