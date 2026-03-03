import * as React from 'react';
import InstallWizard from '@flightctl/ui-components/src/components/Catalog/InstallWizard/InstallWizard';
import WithPageLayout from '../common/WithPageLayout';

const OcpInstallWizard = () => {
  return (
    <WithPageLayout>
      <InstallWizard />
    </WithPageLayout>
  );
};

export default OcpInstallWizard;
