import * as React from 'react';
import EditDeviceWizard from '@flightctl/ui-components/src/components/Device/EditDeviceWizard/EditDeviceWizard';
import WithPageLayout from '../common/WithPageLayout';

const EditDeviceWizardPage = () => {
  return (
    <WithPageLayout>
      <EditDeviceWizard />
    </WithPageLayout>
  );
};

export default EditDeviceWizardPage;
