import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const OverviewStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Explore the Overview dashboard')} />
      <StepBody>
        {t(
          'The Overview page gives you an at-a-glance summary of your edge environment. The Status card shows device and application health. The Tasks card tracks pending enrollment requests. The Security card surfaces active vulnerabilities. Use this page as your starting point each day.',
        )}
      </StepBody>
      <StepHint>{t('Cards adapt to what you have permission to see. Some may not appear for all roles.')}</StepHint>
    </>
  );
};

export default OverviewStep;
