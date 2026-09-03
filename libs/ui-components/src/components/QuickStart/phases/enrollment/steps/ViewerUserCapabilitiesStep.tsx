import * as React from 'react';

import { StepBody, StepHeader, StepItemList } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

export type ViewerUserCapabilitiesPermissions = {
  canListDevices: boolean;
  canViewDevice: boolean;
  canListEnrollmentRequests: boolean;
};

// This step is only shown to viewers who cannot approve enrollment requests.
const ViewerUserCapabilitiesStep = ({
  canListDevices,
  canListEnrollmentRequests,
  canViewDevice,
}: ViewerUserCapabilitiesPermissions) => {
  const { t } = useTranslation();

  const capabilities: string[] = [];
  if (canListDevices) {
    capabilities.push(t('View enrolled device health and status in the devices table'));
  }
  if (canListEnrollmentRequests) {
    capabilities.push(t('View pending enrollment requests in the panel above the table'));
  }
  if (canViewDevice) {
    capabilities.push(t('Open enrolled and pending devices detail pages to review configuration and status'));
  }

  return (
    <>
      <StepHeader title={t('What you can do on Devices')} />
      {capabilities.length > 0 ? (
        <StepItemList title={t('With your current permissions, you can')} items={capabilities} />
      ) : (
        <StepBody>{t('The Devices page is where your organization manages enrolled edge hardware.')}</StepBody>
      )}
      <StepBody>
        {t(
          'Flashing devices, approving enrollment requests, and adding devices are handled by an administrator or operator and your administrator or image builder.',
        )}
      </StepBody>
    </>
  );
};

export default ViewerUserCapabilitiesStep;
