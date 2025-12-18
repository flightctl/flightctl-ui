import * as React from 'react';
import {
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';

import { useTranslation } from '../../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../../hooks/useNavigate';

const AlertsEmptyState = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      headingLevel="h5"
      icon={SearchIcon}
      titleText={t('There are no active Alerts at this time')}
      variant={EmptyStateVariant.sm}
    >
      <EmptyStateBody>
        <Content component="p">
          {t('This area displays current notifications about your monitored devices and fleets.')}{' '}
          {t('Alerts will appear here if an issue is detected.')}
        </Content>
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Link to={ROUTE.DEVICES}>{t('View devices')}</Link>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default AlertsEmptyState;
