import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ConfigureImageOutputStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Configure your image output')} />
      <StepBody>
        {t(
          'Choose where the finished image is pushed, name and tag the output image, and optionally select disk export formats (ISO, QCOW2, and others).',
        )}
      </StepBody>
      <StepHint>{t('Use the wizard Next button when you are ready to continue to device enrollment.')}</StepHint>
    </>
  );
};

export default ConfigureImageOutputStep;
