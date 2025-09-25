import * as React from 'react';
import Overview from '@flightctl/ui-components/src/components/OverviewPage/Overview';
import { PageSection } from '@patternfly/react-core';
import WithPageLayout from '../common/WithPageLayout';

const OverviewTab = () => {
  return (
    <WithPageLayout>
      <PageSection>
        <Overview />
      </PageSection>
    </WithPageLayout>
  );
};

export default OverviewTab;
