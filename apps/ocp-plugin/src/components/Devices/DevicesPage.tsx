import * as React from 'react';
import DevicesPage from '@flightctl/ui-components/src/components/Device/DevicesPage/DevicesPage';
import WithPageLayout from '../common/WithPageLayout';

const OcpDevicesPage = () => {
  return (
    <WithPageLayout>
      <DevicesPage />
    </WithPageLayout>
  );
};

export default OcpDevicesPage;
