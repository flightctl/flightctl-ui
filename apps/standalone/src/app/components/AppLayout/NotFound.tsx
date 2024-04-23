import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  PageSection,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ROUTE, useNavigate } from '@flightctl/ui-components/hooks/useNavigate';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateHeader
          titleText={t('404 Page not found')}
          icon={<EmptyStateIcon icon={ExclamationTriangleIcon} />}
          headingLevel="h1"
        />
        <EmptyStateBody>{t(`We didn't find a page that matches the address you navigated to.`)}</EmptyStateBody>
        <EmptyStateFooter>
          <Button onClick={() => navigate(ROUTE.ROOT)}>{t('Take me home')}</Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export default NotFound;
