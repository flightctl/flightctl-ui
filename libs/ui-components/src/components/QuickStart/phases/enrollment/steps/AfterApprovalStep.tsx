import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const AfterApprovalStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('What happens after approval')} />
      <StepBody>
        {t(
          'After approval, the device appears in the enrolled devices table with connectivity status and fleet membership. You can open its detail page to monitor health and apply updates.',
        )}
      </StepBody>
      <StepHint>{t('Browse approved devices in the enrolled devices table.')}</StepHint>
    </>
  );
};

export default AfterApprovalStep;
