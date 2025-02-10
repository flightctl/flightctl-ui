import * as React from 'react';
import Overview from './Overview';
import { useTranslation } from '../../hooks/useTranslation';
import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import TechPreviewBadge from '../common/TechPreviewBadge';

const OverviewPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="3xl" role="heading">
          {t('Overview')}
          <TechPreviewBadge />
        </Title>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Overview />
      </PageSection>
    </>
  );
};

export default OverviewPage;
