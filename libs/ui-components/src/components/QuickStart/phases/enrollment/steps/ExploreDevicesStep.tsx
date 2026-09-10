import * as React from 'react';
import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';
import EnrolledDeviceListPreview from './EnrolledDeviceListPreview';

const ExploreDevicesStep = ({ hasDevices }: { hasDevices: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Preview enrolled devices')} />

      <StepBody>
        {hasDevices
          ? t(
              'Some devices are already enrolled to the system. Browse their connectivity and fleet membership to see what an approved device looks like.',
            )
          : t(
              'The enrolled devices table is empty right now. Once devices are approved, each row will show connectivity and fleet membership.',
            )}
      </StepBody>
      {!hasDevices && <EnrolledDeviceListPreview />}
      <StepHint>{t('Each row shows connectivity and fleet membership.')}</StepHint>
    </>
  );
};

export default ExploreDevicesStep;
