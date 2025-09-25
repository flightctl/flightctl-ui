import * as React from 'react';
import CreateRepository from '@flightctl/ui-components/src/components/Repository/CreateRepository/CreateRepository';
import WithPageLayout from '../common/WithPageLayout';

const CreateRepositoryPage = () => {
  return (
    <WithPageLayout>
      <CreateRepository />
    </WithPageLayout>
  );
};

export default CreateRepositoryPage;
