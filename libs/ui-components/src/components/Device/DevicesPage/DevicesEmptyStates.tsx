import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, EmptyStateActions, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';
import MicrochipIcon from '@patternfly/react-icons/dist/js/icons/microchip-icon';
import BanIcon from '@patternfly/react-icons/dist/js/icons/ban-icon';

import { useAccessReview } from '../../../hooks/useAccessReview';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../hooks/useNavigate';
import { RESOURCE, VERB } from '../../../types/rbac';
import ResourceListEmptyState from '../../common/ResourceListEmptyState';

type DevicesEmptyStateProps = {
  onAddDevice: VoidFunction;
};

export const EnrolledDevicesEmptyState = ({ onAddDevice }: DevicesEmptyStateProps) => {
  const { t } = useTranslation();
  const [permissions] = useAccessReview([{ kind: RESOURCE.FLEET, verb: VERB.CREATE }]);
  const [canCreateFleet = false] = permissions;
  return (
    <ResourceListEmptyState icon={MicrochipIcon} titleText={t('No devices here!')}>
      <EmptyStateBody>
        {canCreateFleet ? (
          <Trans t={t}>
            You can add devices and label them to match fleets, or you can{' '}
            <Link to={ROUTE.FLEET_CREATE}>start with a fleet</Link> and add devices into it.
          </Trans>
        ) : (
          t('You can add devices and label them to match fleets')
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button aria-label={t('Add devices')} onClick={onAddDevice}>
            {t('Add devices')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </ResourceListEmptyState>
  );
};

export const DecommissionedDevicesEmptyState = () => {
  const { t } = useTranslation();
  return <ResourceListEmptyState icon={BanIcon} titleText={t('No decommissioning or decommissioned devices here!')} />;
};
