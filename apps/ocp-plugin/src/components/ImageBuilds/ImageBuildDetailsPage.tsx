import * as React from 'react';
import ImageBuildDetails from '@flightctl/ui-components/src/components/ImageBuilds/ImageBuildDetails/ImageBuildDetailsPage';
import WithPageLayout from '../common/WithPageLayout';

const OcpImageBuildDetailsPage = () => {
  return (
    <WithPageLayout>
      <ImageBuildDetails />
    </WithPageLayout>
  );
};

export default OcpImageBuildDetailsPage;
