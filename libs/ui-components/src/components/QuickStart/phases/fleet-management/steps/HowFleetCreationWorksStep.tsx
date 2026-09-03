import * as React from 'react';

import { StepBody, StepHeader } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const HowFleetCreationWorksStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('How fleet creation works')} />
      <StepBody>
        {t(
          'Creating a fleet involves three steps: defining a label selector (which devices belong to this fleet), configuring the device template (desired OS, applications, and configurations), and setting an update policy (batch size and disruption budget for rollouts). Once created, matching devices automatically receive the fleet configuration.',
        )}
      </StepBody>
    </>
  );
};

export default HowFleetCreationWorksStep;
