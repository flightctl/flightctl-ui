import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const StartNewImageBuildStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Start a new image build')} />
      <StepBody>
        {t(
          'Click "Build new image" in the toolbar to open the image build wizard. This guides you through selecting a base OS, configuring output, embedding the enrollment certificate, and optionally publishing to the Software Catalog.',
        )}
      </StepBody>
      <StepHint>{t("You'll need access to at least one OCI repository where base images are stored.")}</StepHint>
    </>
  );
};

export default StartNewImageBuildStep;
