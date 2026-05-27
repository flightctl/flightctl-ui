import * as React from 'react';
import NewVersionImageBuildWizard from '@flightctl/ui-components/src/components/ImageBuilds/NewVersionImageBuildWizard/NewVersionImageBuildWizard';
import WithPageLayout from '../common/WithPageLayout';

const NewVersionImageBuildWizardPage = () => {
  return (
    <WithPageLayout>
      <NewVersionImageBuildWizard />
    </WithPageLayout>
  );
};

export default NewVersionImageBuildWizardPage;
