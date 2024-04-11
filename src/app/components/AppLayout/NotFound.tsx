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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
          <Button onClick={() => navigate('/')}>{t('Take me home')}</Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export default NotFound;
