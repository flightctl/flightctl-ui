import * as React from 'react';

import { StepHeader, StepItemList } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

export type TeamEscalationPermissions = {
  canApproveEnrollment: boolean;
  canDownloadExport: boolean;
  canCreateExport: boolean;
};

const TeamEscalationStep = ({
  canApproveEnrollment,
  canDownloadExport,
  canCreateExport,
}: TeamEscalationPermissions) => {
  const { t } = useTranslation();

  const needs: string[] = [];
  if (!canApproveEnrollment) {
    needs.push(t('Approve a device pending approval'));
  }
  if (!canDownloadExport && !canCreateExport) {
    needs.push(t('Download a disk image to provision a device'));
  }

  if (needs.length === 0) {
    return null;
  }

  return (
    <>
      <StepHeader title={t('When you need help from your team')} />
      <StepItemList title={t('Contact your administrator if you need to')} items={needs} />
    </>
  );
};

export default TeamEscalationStep;
