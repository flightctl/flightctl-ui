import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';
import PendingDeviceListPreview from './PendingDeviceListPreview';

const FindPendingDevicesStep = ({ hasPendingDevices }: { hasPendingDevices: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Find devices pending approval')} />
      <StepBody>
        {hasPendingDevices
          ? t(
              'When a device boots for the first time, it stays in Devices pending approval panel until approved. Each row shows the device alias, name, and when the request was created.',
            )
          : t(
              'When a device boots for the first time, it stays in Devices pending approval panel until approved. The panel is empty right now. Once a device requests enrollment, each row will show the device alias, name, and when the request was created.',
            )}
      </StepBody>
      {hasPendingDevices ? (
        <StepHint>{t('Check the pending requests panel above the enrolled devices table.')}</StepHint>
      ) : (
        <PendingDeviceListPreview />
      )}
    </>
  );
};

export default FindPendingDevicesStep;
