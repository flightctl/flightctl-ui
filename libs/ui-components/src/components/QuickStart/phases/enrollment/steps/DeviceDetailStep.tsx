import * as React from 'react';

import { StepBody, StepHeader } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const DeviceDetailStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('What a device detail page shows')} />
      <StepBody>
        {t(
          'After approval, devices appear in the enrolled devices table. Open a device detail page to check connectivity status, system resources, and OS version.',
        )}
      </StepBody>
    </>
  );
};

export default DeviceDetailStep;
