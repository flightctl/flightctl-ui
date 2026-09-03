import * as React from 'react';

import { StepBody, StepHeader } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const OpenDetailsPageStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Open the details page')} />
      <StepBody>
        {t(
          'Click a build name in the list or choose View more after expanding a row to open its detail page for configuration, exports, YAML, and logs.',
        )}
      </StepBody>
    </>
  );
};

export default OpenDetailsPageStep;
