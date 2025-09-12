import * as React from 'react';
import RepositoryList from '@flightctl/ui-components/src/components/Repository/RepositoryList';
import WithPageLayout from '../common/WithPageLayout';

const RepositoriesPage = () => {
  return (
    <WithPageLayout>
      <RepositoryList />
    </WithPageLayout>
  );
};

export default RepositoriesPage;
