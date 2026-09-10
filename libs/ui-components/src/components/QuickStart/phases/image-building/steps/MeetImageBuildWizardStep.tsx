import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const MeetImageBuildWizardStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Meet the image build wizard')} />
      <StepBody>
        {t(
          'This wizard builds a custom edge OS image from a base OS and pushes the result to your registry. Work through five steps on the left (Base image, Image output, Registration, Software Catalog, and Review) with the form for each step on the right. Use the wizard Next button to move between steps. This guide follows along one step at a time.',
        )}
      </StepBody>
      <StepHint>
        {t(
          'Base image and Image output are required. Registration sets enrollment binding. Software Catalog is optional.',
        )}
      </StepHint>
    </>
  );
};

export default MeetImageBuildWizardStep;
