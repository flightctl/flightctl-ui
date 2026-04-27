import * as React from 'react';
import SecurityOverviewPage from '@flightctl/ui-components/src/components/SecurityOverview/SecurityOverviewPage';
import WithPageLayout from '../common/WithPageLayout';

const OcpSecurityOverviewPage = () => {
  return (
    <WithPageLayout>
      <SecurityOverviewPage />
    </WithPageLayout>
  );
};

export default OcpSecurityOverviewPage;
