import * as React from 'react';
import CatalogPage from '@flightctl/ui-components/src/components/Catalog/CatalogPage';
import WithPageLayout from '../common/WithPageLayout';

const OcpCatalogPage = () => {
  return (
    <WithPageLayout>
      <CatalogPage />
    </WithPageLayout>
  );
};

export default OcpCatalogPage;
