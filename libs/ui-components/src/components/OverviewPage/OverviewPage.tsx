import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import Overview from './Overview';

const OverviewPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageSection hasBodyWrapper={false} >
        <Title headingLevel="h1" size="3xl" role="heading">
          {t('Overview')}
        </Title>
      </PageSection>
      <PageSection hasBodyWrapper={false}  isFilled>
        <Overview />
      </PageSection>
    </>
  );
};

export default OverviewPage;
