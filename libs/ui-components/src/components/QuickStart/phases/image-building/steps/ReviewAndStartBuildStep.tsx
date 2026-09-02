import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ReviewAndStartBuildStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Review and start the build')} />
      <StepBody>
        {t(
          'Confirm your base image, output, registration, and catalog choices, then click Build image to start the build.',
        )}
      </StepBody>
      <StepHint>{t('Review the summary on the right before submitting.')}</StepHint>
    </>
  );
};

export default ReviewAndStartBuildStep;
