import * as React from 'react';
import ImportCatalogWizard from '@flightctl/ui-components/src/components/Catalog/ImportCatalogWizard/ImportCatalogWizard';
import WithPageLayout from '../common/WithPageLayout';

const OcpImportCatalogWizard = () => {
  return (
    <WithPageLayout>
      <ImportCatalogWizard />
    </WithPageLayout>
  );
};

export default OcpImportCatalogWizard;
