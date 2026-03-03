import * as React from 'react';
import { EditFleetWizard } from '@flightctl/ui-components/src/components/Catalog/EditWizard/EditWizard';
import WithPageLayout from '../common/WithPageLayout';

const CatalogEditFleetWizard = () => {
  return (
    <WithPageLayout>
      <EditFleetWizard />
    </WithPageLayout>
  );
};

export default CatalogEditFleetWizard;
