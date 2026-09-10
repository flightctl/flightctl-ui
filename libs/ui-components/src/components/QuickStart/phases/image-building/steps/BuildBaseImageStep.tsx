import * as React from 'react';

import { useProductName } from '../../../../../hooks/useProductName';
import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const BuildBaseImageStep = () => {
  const { t } = useTranslation();
  const productName = useProductName();

  return (
    <>
      <StepHeader title={t('Build your base image')} />
      <StepBody>
        {t(
          'Name your build and choose the source OS from your registry: select the repository, enter the base image path and version tag, and confirm the reference URL {{ productName }} will pull from.',
          { productName },
        )}
      </StepBody>
      <StepHint>{t('Use a descriptive build name and registry paths your team recognizes.')}</StepHint>
    </>
  );
};

export default BuildBaseImageStep;
