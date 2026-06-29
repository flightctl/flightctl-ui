import * as React from 'react';
import { Content, PageSection, Stack, StackItem, Title } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import Overview from './Overview';

const OverviewPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="3xl" role="heading" aria-level={1}>
              {t('Overview')}
            </Title>
          </StackItem>
          <StackItem>
            <Content data-testid="list-page-description">
              {t('View the health of your edge environment and explore details across devices, fleets, and security.')}
            </Content>
          </StackItem>
        </Stack>
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled>
        <Overview />
      </PageSection>
    </>
  );
};

export default OverviewPage;
