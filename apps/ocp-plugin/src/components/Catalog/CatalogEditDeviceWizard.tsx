import * as React from 'react';
import { EditDeviceWizard } from '@flightctl/ui-components/src/components/Catalog/EditWizard/EditWizard';
import WithPageLayout from '../common/WithPageLayout';

const CatalogEditDeviceWizard = () => {
  return (
    <WithPageLayout>
      <EditDeviceWizard />
    </WithPageLayout>
  );
};

export default CatalogEditDeviceWizard;
