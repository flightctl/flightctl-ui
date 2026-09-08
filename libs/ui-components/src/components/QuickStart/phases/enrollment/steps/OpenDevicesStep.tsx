import * as React from 'react';
import { type TFunction } from 'react-i18next';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const devicesPageInfo = (t: TFunction) =>
  t(
    'The Devices page is your central hub for all managed edge hardware. From here you can monitor enrolled device health and status and view pending enrollment requests. Each row shows device connectivity, OS version, and fleet membership at a glance.',
  );

const withEmptyDevices = (t: TFunction) =>
  t(
    'This is your device hub. The enrolled devices table is empty right now. Once devices are approved, each row will show connectivity and fleet membership. To show you what it will look like, click the link below.',
  );

const withData = (t: TFunction) =>
  t('This is your device hub. Enrolled devices appear in the table below with connectivity and fleet membership.');

type OpenDevicesStepProps = {
  hasDevices: boolean;
  isOnDevicesPage: boolean;
};

const StepBodyContent = ({ hasDevices, isOnDevicesPage }: OpenDevicesStepProps) => {
  const { t } = useTranslation();
  if (!isOnDevicesPage) {
    return <StepBody>{devicesPageInfo(t)}</StepBody>;
  }
  if (!hasDevices) {
    return <StepBody>{withEmptyDevices(t)}</StepBody>;
  }

  return <StepBody>{withData(t)}</StepBody>;
};

const OpenDevicesStep = ({ hasDevices, isOnDevicesPage }: OpenDevicesStepProps) => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Open the Devices page')} />

      <StepBodyContent hasDevices={hasDevices} isOnDevicesPage={isOnDevicesPage} />

      <StepHint>
        {t('Devices requiring approval appear in the panel above the table when a device first boots.')}
      </StepHint>
    </>
  );
};

export default OpenDevicesStep;
