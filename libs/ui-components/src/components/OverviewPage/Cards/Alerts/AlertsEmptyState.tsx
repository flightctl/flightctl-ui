import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Text,
} from '@patternfly/react-core';
import { EmptyStateActions } from '@patternfly/react-core/dist/esm/components/EmptyState/EmptyStateActions';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';

import { useTranslation } from '../../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../../hooks/useNavigate';

const AlertsEmptyState = () => {
  const { t } = useTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.sm}>
      <EmptyStateHeader
        titleText={t('There are no active Alerts at this time')}
        headingLevel="h5"
        icon={<EmptyStateIcon icon={SearchIcon} />}
      />
      <EmptyStateBody>
        <Text>
          {t('This area displays current notifications about your monitored devices and fleets.')}{' '}
          {t('Alerts will appear here if an issue is detected.')}
        </Text>
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
