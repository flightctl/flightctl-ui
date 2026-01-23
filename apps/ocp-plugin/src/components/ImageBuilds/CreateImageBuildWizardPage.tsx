import * as React from 'react';
import CreateImageBuildWizard from '@flightctl/ui-components/src/components/ImageBuilds/CreateImageBuildWizard/CreateImageBuildWizard';
import WithPageLayout from '../common/WithPageLayout';

const CreateImageBuildWizardPage = () => {
  return (
    <WithPageLayout>
      <CreateImageBuildWizard />
    </WithPageLayout>
  );
};

export default CreateImageBuildWizardPage;
