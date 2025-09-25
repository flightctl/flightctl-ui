import * as React from 'react';
import RepositoryDetails from '@flightctl/ui-components/src/components/Repository/RepositoryDetails/RepositoryDetails';
import WithPageLayout from '../common/WithPageLayout';

const RepositoryDetailsPage = () => {
  return (
    <WithPageLayout>
      <RepositoryDetails />
    </WithPageLayout>
  );
};

export default RepositoryDetailsPage;
