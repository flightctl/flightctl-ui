import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ReviewRequestStep = ({ canViewEr, canApprove }: { canViewEr: boolean; canApprove: boolean }) => {
  const { t } = useTranslation();

  if (!canViewEr && !canApprove) {
    return (
      <>
        <StepHeader title={t('Enrollment details')} />
        <StepBody>
          {t('You do not have permission to view details for devices pending approval or to approve them.')}
        </StepBody>
      </>
    );
  }

  return (
    <>
      <StepHeader title={t('Review the enrollment details')} />
      <StepBody>
        {canViewEr &&
          t(
            'Click a device pending approval to review system information, requested labels, and the certificate signing request.',
          )}
        {canApprove && (
          <span className="pf-v6-u-ml-xs">{t('Verify it matches the device you booted before approving.')}</span>
        )}
      </StepBody>
      <StepHint>{t('Select a request in the pending devices panel to open its details.')}</StepHint>
    </>
  );
};

export default ReviewRequestStep;
