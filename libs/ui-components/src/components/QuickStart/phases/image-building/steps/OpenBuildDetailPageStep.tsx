import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const OpenBuildDetailPageStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Open the build detail page')} />
      <StepBody>
        {t(
          'Click the build name in the list or View more in the expanded panel to open the detail page for configuration, exports, YAML, and logs.',
        )}
      </StepBody>
      <StepHint>{t('You can open any build from the list.')}</StepHint>
    </>
  );
};

export default OpenBuildDetailPageStep;
