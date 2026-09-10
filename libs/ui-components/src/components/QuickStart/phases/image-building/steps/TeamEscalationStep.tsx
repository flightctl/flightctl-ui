import * as React from 'react';

import { StepHeader, StepItemList } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

export type ImageBuildTeamEscalationPermissions = {
  canCreateBuild: boolean;
  canCreateExport: boolean;
  canDownloadExport: boolean;
  canAddToCatalog: boolean;
};

const TeamEscalationStep = ({
  canCreateBuild,
  canCreateExport,
  canDownloadExport,
  canAddToCatalog,
}: ImageBuildTeamEscalationPermissions) => {
  const { t } = useTranslation();

  const needs: string[] = [];
  if (!canCreateBuild) {
    needs.push(t('Request a new or updated OS image'));
  }
  if (!canCreateExport && !canDownloadExport) {
    needs.push(t('Obtain a disk image for device provisioning'));
  }
  if (!canAddToCatalog) {
    needs.push(t('Publish a build to the Software Catalog'));
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
