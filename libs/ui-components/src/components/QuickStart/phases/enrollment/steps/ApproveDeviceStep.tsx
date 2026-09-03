import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ApproveDeviceStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Approve the enrollment')} />
      <StepBody>
        {t(
          'Click Approve to accept a device into your managed environment. After approval, it moves from pending requests into the enrolled devices table.',
        )}
      </StepBody>
      <StepHint>{t('Use the Approve action on a pending request to bring the device under management.')}</StepHint>
    </>
  );
};

export default ApproveDeviceStep;
