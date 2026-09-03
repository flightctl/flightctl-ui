import * as React from 'react';
import { type TFunction } from 'react-i18next';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

import FleetListPreview from './FleetListPreview';

const viewerOrientation = (t: TFunction) =>
  t(
    'Fleets group edge devices that share the same desired configuration: OS image, installed applications, and update policies. From this page you can see which devices belong to each fleet and check fleet compliance and system image versions.',
  );

const emptyTable = (t: TFunction) =>
  t(
    'Fleets group devices that share the same configuration. This page is empty right now. Once you create a fleet, each row will show its name, system image, member count, and rollout status.',
  );

const withData = (t: TFunction) =>
  t(
    'Fleets group devices that share the same configuration. Each row shows a fleet name, system image, member count, and rollout status.',
  );

type OpenFleetsStepProps = {
  hasFleets: boolean;
  canCreateFleet: boolean;
  isOnFleetsPage: boolean;
};

const StepBodyContent = ({ hasFleets, canCreateFleet, isOnFleetsPage }: OpenFleetsStepProps) => {
  const { t } = useTranslation();

  if (!isOnFleetsPage && !canCreateFleet) {
    return <StepBody>{viewerOrientation(t)}</StepBody>;
  }

  return <StepBody>{hasFleets ? withData(t) : emptyTable(t)}</StepBody>;
};

const OpenFleetsStep = ({ hasFleets, canCreateFleet, isOnFleetsPage }: OpenFleetsStepProps) => {
  const { t } = useTranslation();

  const showCreateFleetHint = !hasFleets && canCreateFleet;
  const showFleetPreview = !hasFleets && !canCreateFleet;
  return (
    <>
      <StepHeader title={t('Open the Fleets page')} />

      <StepBodyContent hasFleets={hasFleets} canCreateFleet={canCreateFleet} isOnFleetsPage={isOnFleetsPage} />

      {showFleetPreview && <FleetListPreview />}
      <StepHint>{t("Devices matching a fleet's label selector join automatically.")}</StepHint>
      {showCreateFleetHint && (
        <StepHint hasGap>{t('Use Create fleet in the empty state to create your first fleet.')}</StepHint>
      )}
    </>
  );
};

export default OpenFleetsStep;
