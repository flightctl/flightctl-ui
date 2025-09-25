import * as React from 'react';
import CreateFleetWizard from '@flightctl/ui-components/src/components/Fleet/CreateFleet/CreateFleetWizard';
import WithPageLayout from '../common/WithPageLayout';

const CreateFleetWizardPage = () => {
  return (
    <WithPageLayout>
      <CreateFleetWizard />
    </WithPageLayout>
  );
};

export default CreateFleetWizardPage;
