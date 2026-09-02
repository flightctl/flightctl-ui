import * as React from 'react';

import { StepBody, StepHeader, StepItemList } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

export type FleetViewerUserCapabilitiesPermissions = {
  canListFleets: boolean;
  canViewFleet: boolean;
  canEditFleet: boolean;
};

// User cannot create new fleets
const ViewerUserCapabilitiesStep = ({
  canListFleets,
  canViewFleet,
  canEditFleet,
}: FleetViewerUserCapabilitiesPermissions) => {
  const { t } = useTranslation();

  const capabilities: string[] = [];
  if (canListFleets) {
    capabilities.push(t('Browse fleets and see member counts, system images, and rollout status in the table'));
  }
  if (canViewFleet) {
    capabilities.push(t('Open a fleet detail page to review its device selector and configuration template'));
  }
  if (canEditFleet) {
    capabilities.push(t('Update fleet configurations and track rollout progress'));
  }

  return (
    <>
      <StepHeader title={t('What you can do on Fleets')} />
      {capabilities.length > 0 ? (
        <StepItemList title={t('With your current permissions, you can')} items={capabilities} />
      ) : (
        <StepBody>
          {t('The Fleets page is where your organization groups edge devices that share the same configuration.')}
        </StepBody>
      )}
      <StepBody>{t('Creating fleets and defining rollout policies are handled by your fleet administrator.')}</StepBody>
    </>
  );
};

export default ViewerUserCapabilitiesStep;
