import * as React from 'react';
import { type TFunction } from 'react-i18next';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

// | isOnDevicesPage | canApproveEr | hasDevices | message           |
// |-----------------|--------------|------------|-------------------|
// | no              | no           | *          | viewerOrientation |
// | yes             | no           | no         | viewerEmptyTable  |
// | *               | *            | yes        | withData          |
// | *               | yes          | no         | adminTour         |

const viewerOrientation = (t: TFunction) =>
  t(
    'The Devices page is your central hub for all managed edge hardware. From here you can monitor enrolled device health and status and view pending enrollment requests. Each row shows device connectivity, OS version, and fleet membership at a glance.',
  );

const viewerEmptyTable = (t: TFunction) =>
  t(
    'This is your device hub. The enrolled devices table is empty right now. Once devices are approved, each row will show connectivity and fleet membership.',
  );

const withData = (t: TFunction) =>
  t('This is your device hub. Enrolled devices appear in the table below with connectivity and fleet membership.');

const adminTour = (t: TFunction) =>
  t(
    'This is your device hub. On first login the enrolled devices table is empty. To show you what it will look like, an example row called example-device appears below with connectivity and fleet membership.',
  );

type OpenDevicesStepProps = {
  hasDevices: boolean;
  canApproveEr: boolean;
  isOnDevicesPage: boolean;
};

const StepBodyContent = ({ hasDevices, canApproveEr, isOnDevicesPage }: OpenDevicesStepProps) => {
  const { t } = useTranslation();
  if (!canApproveEr && !isOnDevicesPage) {
    return <StepBody>{viewerOrientation(t)}</StepBody>;
  }
  if (!canApproveEr && isOnDevicesPage && !hasDevices) {
    return <StepBody>{viewerEmptyTable(t)}</StepBody>;
  }

  return <StepBody>{hasDevices ? withData(t) : adminTour(t)}</StepBody>;
};

const OpenDevicesStep = ({ hasDevices, canApproveEr, isOnDevicesPage }: OpenDevicesStepProps) => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Open the Devices page')} />

      <StepBodyContent hasDevices={hasDevices} canApproveEr={canApproveEr} isOnDevicesPage={isOnDevicesPage} />

      <StepHint>
        {t('Devices requiring approval appear in the panel above the table when a device first boots.')}
      </StepHint>
    </>
  );
};

export default OpenDevicesStep;
