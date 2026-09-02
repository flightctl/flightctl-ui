import * as React from 'react';

import { useProductName } from '../../../../../hooks/useProductName';
import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const ConfigureDeviceEnrollmentStep = () => {
  const { t } = useTranslation();
  const productName = useProductName();

  return (
    <>
      <StepHeader title={t('Configure device enrollment')} />
      <StepBody>
        {t(
          'Choose how devices enroll with {{ productName }}. Early binding embeds an enrollment certificate in the image so devices auto-register on first boot with zero-touch provisioning. No cloud-init or Ignition scripts are needed. Late binding omits the certificate and relies on cloud-init or Ignition at first boot to complete registration instead. You can also configure optional first-boot settings such as the onboarding wizard and SSH access.',
          { productName },
        )}
      </StepBody>
      <StepHint>
        {t(
          'Early binding is recommended for most edge deployments. Use wizard Next when you are ready for Software Catalog.',
        )}
      </StepHint>
    </>
  );
};

export default ConfigureDeviceEnrollmentStep;
