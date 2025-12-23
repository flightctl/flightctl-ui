import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter, PageSection } from '@patternfly/react-core';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { ROUTE, useNavigate } from '@flightctl/ui-components/src/hooks/useNavigate';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageSection hasBodyWrapper={false}>
      <EmptyState headingLevel="h1" icon={ExclamationTriangleIcon} titleText={t('404 Page not found')} variant="full">
        <EmptyStateBody>{t(`We didn't find a page that matches the address you navigated to.`)}</EmptyStateBody>
        <EmptyStateFooter>
          <Button onClick={() => navigate(ROUTE.ROOT)}>{t('Take me home')}</Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export default NotFound;
