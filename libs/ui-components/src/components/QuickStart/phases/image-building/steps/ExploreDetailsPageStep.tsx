import * as React from 'react';

import { StepBody, StepHeader } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ExploreDetailsPageStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Explore the details page')} />
      <StepBody>
        {t(
          'On the details page, tabs organize what you can review: Base image for settings, Export images for disk formats, YAML for the resource definition, and Logs for troubleshooting.',
        )}
      </StepBody>
    </>
  );
};

export default ExploreDetailsPageStep;
