import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, EmptyStateBody, PageSection } from '@patternfly/react-core';

const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <PageSection hasBodyWrapper={false} >
      <EmptyState  headingLevel="h4"   titleText={t('Restricted Access')}>
        <EmptyStateBody>{t("You don't have access to this section.")}</EmptyStateBody>
      </EmptyState>
    </PageSection>
  );
};

export default AccessDenied;
