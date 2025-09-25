import * as React from 'react';
import FleetsPage from '@flightctl/ui-components/src/components/Fleet/FleetsPage';
import WithPageLayout from '../common/WithPageLayout';

const OcpFleetsPage = () => {
  return (
    <WithPageLayout>
      <FleetsPage />
    </WithPageLayout>
  );
};

export default OcpFleetsPage;
