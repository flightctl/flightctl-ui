import * as React from 'react';
import Overview from './Overview';
import { useTranslation } from '../../hooks/useTranslation';
import { Flex, FlexItem, PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import TechPreviewBadge from '../common/TechPreviewBadge';

const OverviewPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1" size="3xl" role="heading">
              {t('Overview')}
            </Title>
          </FlexItem>
          <FlexItem>
            <TechPreviewBadge />
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Overview />
      </PageSection>
    </>
  );
};

export default OverviewPage;
