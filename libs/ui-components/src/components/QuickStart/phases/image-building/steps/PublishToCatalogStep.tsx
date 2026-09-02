import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const PublishToCatalogStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Publish to Software Catalog')} />
      <StepBody>
        {t(
          'Optionally publish the built image to the Software Catalog testing channel after a successful build so other teams can discover and deploy it.',
        )}
      </StepBody>
      <StepHint>
        {t(
          'You can skip this step or publish later from the build detail page. Use wizard Next when you are ready for review.',
        )}
      </StepHint>
    </>
  );
};

export default PublishToCatalogStep;
