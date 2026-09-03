import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ExpandBuildRowStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Expand a build row')} />
      <StepBody>
        {t(
          'After a build finishes, click the expand control at the start of its row to open the summary panel. Use the panel to track progress, review exports, and open the detail page.',
        )}
      </StepBody>
      <StepHint>
        {t(
          'Building and exporting can take a few minutes. You can close the guide and return when your build is ready.',
        )}
      </StepHint>
    </>
  );
};

export default ExpandBuildRowStep;
