import * as React from 'react';

import { StepHeader, StepItemList } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

export type FleetTeamEscalationPermissions = {
  canCreateFleet: boolean;
  canEditFleet: boolean;
};

const FleetTeamEscalationStep = ({ canCreateFleet, canEditFleet }: FleetTeamEscalationPermissions) => {
  const { t } = useTranslation();

  const needs: string[] = [];
  if (!canCreateFleet) {
    needs.push(t('Request a new fleet for your devices'));
  }
  if (!canEditFleet) {
    needs.push(t('Change fleet configurations or update rollout policies'));
  }

  if (needs.length === 0) {
    return null;
  }

  return (
    <>
      <StepHeader title={t('When you need help from your team')} />
      <StepItemList title={t('Contact your fleet administrator if you need to')} items={needs} />
    </>
  );
};

export default FleetTeamEscalationStep;
