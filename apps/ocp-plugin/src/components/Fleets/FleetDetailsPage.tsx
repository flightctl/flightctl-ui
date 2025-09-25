import * as React from 'react';
import FleetDetails from '@flightctl/ui-components/src/components/Fleet/FleetDetails/FleetDetailsPage';
import WithPageLayout from '../common/WithPageLayout';

const FleetDetailsPage = () => {
  return (
    <WithPageLayout>
      <FleetDetails />
    </WithPageLayout>
  );
};

export default FleetDetailsPage;
