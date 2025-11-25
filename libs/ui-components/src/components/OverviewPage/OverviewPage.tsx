import * as React from 'react';
import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import Overview from './Overview';

const OverviewPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="3xl" role="heading">
          {t('Overview')}
        </Title>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Overview />
      </PageSection>
    </>
  );
};

export default OverviewPage;
