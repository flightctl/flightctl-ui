import * as React from 'react';
import ImageBuildsPage from '@flightctl/ui-components/src/components/ImageBuilds/ImageBuildsPage';
import WithPageLayout from '../common/WithPageLayout';

const OcpImageBuildsPage = () => {
  return (
    <WithPageLayout>
      <ImageBuildsPage />
    </WithPageLayout>
  );
};

export default OcpImageBuildsPage;
