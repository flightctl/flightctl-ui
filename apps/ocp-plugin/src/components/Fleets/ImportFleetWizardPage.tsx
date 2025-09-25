import * as React from 'react';
import ImportFleetWizard from '@flightctl/ui-components/src/components/Fleet/ImportFleetWizard/ImportFleetWizard';
import WithPageLayout from '../common/WithPageLayout';

const ImportFleetWizardPage = () => {
  return (
    <WithPageLayout>
      <ImportFleetWizard />
    </WithPageLayout>
  );
};

export default ImportFleetWizardPage;
