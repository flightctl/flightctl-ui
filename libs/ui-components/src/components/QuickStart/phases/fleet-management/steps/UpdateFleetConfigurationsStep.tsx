import * as React from 'react';

import { useProductName } from '../../../../../hooks/useProductName';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { StepBody, StepHeader } from '../../../guide/StepChrome';

const UpdateFleetConfigurationsStep = () => {
  const { t } = useTranslation();
  const productName = useProductName();

  return (
    <>
      <StepHeader title={t('Update fleet configurations')} />
      <StepBody>
        {t(
          'Open any fleet\'s detail page and click "Edit configurations" to modify the device template. Changes trigger a rollout: {{ productName }} updates member devices according to the fleet\'s update policy.',
          { productName },
        )}
      </StepBody>
    </>
  );
};

export default UpdateFleetConfigurationsStep;
