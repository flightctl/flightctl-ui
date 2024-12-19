import * as React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, EmptyStateBody, EmptyStateHeader, PageSection } from '@patternfly/react-core';

const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <PageSection variant="light">
      <EmptyState>
        <EmptyStateHeader titleText={t('Restricted Access')} headingLevel="h4" />
        <EmptyStateBody>{t("You don't have access to this section.")}</EmptyStateBody>
      </EmptyState>
    </PageSection>
  );
};

export default AccessDenied;
