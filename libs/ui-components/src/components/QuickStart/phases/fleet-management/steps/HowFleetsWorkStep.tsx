import * as React from 'react';

import { useProductName } from '../../../../../hooks/useProductName';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';

const HowFleetsWorkStep = () => {
  const { t } = useTranslation();
  const productName = useProductName();

  return (
    <>
      <StepHeader title={t('How fleets work')} />
      <StepBody>
        {t(
          "Fleets use label selectors to match devices. Any device whose labels satisfy the selector automatically becomes a fleet member. The fleet's device template defines what that group of devices should look like (OS version, apps, configurations). When you update the template, changes roll out to all members based on the fleet's update policy.",
        )}
      </StepBody>
      <StepHint>
        {t(
          'Think of fleets like a desired state: you declare what devices should run, and {{ productName }} drives them toward it.',
          {
            productName,
          },
        )}
      </StepHint>
    </>
  );
};

export default HowFleetsWorkStep;
