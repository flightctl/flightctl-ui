import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ReviewRequestStep = ({ canViewEr, canApprove }: { canViewEr: boolean; canApprove: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Review the enrollment details')} />
      <StepBody>
        {canViewEr &&
          t(
            'Click a device pending approval to review system information, requested labels, and the certificate signing request.',
          )}
        {canApprove && <span>&nbsp;{t('Verify it matches the device you booted before approving.')}</span>}
      </StepBody>
      <StepHint>{t('Select a request in the pending devices panel to open its details.')}</StepHint>
    </>
  );
};

export default ReviewRequestStep;
