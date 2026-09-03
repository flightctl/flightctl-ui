import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const BootDeviceStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Boot the device or VM')} />
      <StepBody>
        {t(
          'Write the downloaded disk image to your edge device (USB stick, SD card, or network boot), or load it into a virtual machine. When the device powers on for the first time, it contacts the control plane and appears as a device pending approval.',
        )}
      </StepBody>
      <StepHint>
        {t('For virtual testing, boot the QCOW2 image in a VM. It connects the same way as physical hardware.')}
      </StepHint>
    </>
  );
};

export default BootDeviceStep;
