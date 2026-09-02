import * as React from 'react';

import { StepBody, StepHeader } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';
import ImageBuildListPreview from './ImageBuildListPreview';

type PreviewInListStepProps = {
  hasBuilds: boolean;
};

const PreviewInListStep = ({ hasBuilds }: PreviewInListStepProps) => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Preview in the list')} />
      <StepBody>
        {hasBuilds
          ? t('Expand a row using the arrow on the left to see a build summary and any export formats available.')
          : t(
              'The image builds table is empty right now. Once a build finishes, expand its row to see a summary and any export formats available.',
            )}
      </StepBody>
      {!hasBuilds && <ImageBuildListPreview />}
    </>
  );
};

export default PreviewInListStep;
