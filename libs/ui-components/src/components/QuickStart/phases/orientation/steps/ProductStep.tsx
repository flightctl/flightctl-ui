import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { useProductName } from '../../../../../hooks/useProductName';

const ProductStep = () => {
  const { t } = useTranslation();
  const productName = useProductName();

  return (
    <>
      <StepHeader title={t('What is {{ productName }}?', { productName })} />
      <StepBody>
        {t(
          '{{ productName }} lets you build OS images, enroll edge devices, organize them into fleets, and deploy software, all from a single console. It handles the full lifecycle from initial provisioning through day-2 operations like updates, monitoring, and decommissioning.',
          { productName },
        )}
      </StepBody>
      <StepHint>
        {t('Think of it as a control plane for all your edge hardware, no matter where it is deployed.')}
      </StepHint>
    </>
  );
};

export default ProductStep;
