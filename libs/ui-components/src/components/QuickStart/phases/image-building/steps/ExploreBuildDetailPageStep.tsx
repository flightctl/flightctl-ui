import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ExploreBuildDetailPageStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Explore the build detail page')} />
      <StepBody>
        {t(
          'The detail page summarizes your build configuration. Base image shows status and settings cards, Export images lists disk formats, YAML shows the resource definition, and Logs can help with troubleshooting.',
        )}
      </StepBody>
      <StepHint>
        {t(
          'The Actions menu at the top includes Rebuild, Add to catalog, and other operations when you have permission.',
        )}
      </StepHint>
      <StepHint hasGap>{t('This is the last step in the image build phase.')}</StepHint>
    </>
  );
};

export default ExploreBuildDetailPageStep;
