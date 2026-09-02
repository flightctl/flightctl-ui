import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const CreateFleetStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Create your first fleet')} />
      <StepBody>
        {t(
          'Click "Create fleet" in the toolbar to open the fleet creation wizard. You will define which devices belong to this fleet, what they should run, and how updates roll out.',
        )}
      </StepBody>
      <StepHint>{t('Fleets group devices that share the same OS image, applications, and update policies.')}</StepHint>
    </>
  );
};

export default CreateFleetStep;
