import * as React from 'react';
import Overview from '@flightctl/ui-components/src/components/OverviewPage/Overview';
import { PageSection } from '@patternfly/react-core';

const OverviewTab = () => {
  return (
    <PageSection>
      <Overview />
    </PageSection>
  );
};

export default OverviewTab;
