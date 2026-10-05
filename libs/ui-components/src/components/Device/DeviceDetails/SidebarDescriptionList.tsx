import * as React from 'react';
import type { TFunction } from 'i18next';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { type DeviceStatus } from '@flightctl/types';

import type { SystemInfoEntry } from '../../../hooks/useDeviceSystemInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import { getDeviceCapability } from '../../../utils/capabilities';
import { OsModeLabel } from '../../common/OsModeContent';
import LabelWithHelperText from '../../common/WithHelperText';
import SystemInfoDescriptionGroup from './SystemInfoDescriptionGroup';

const getEligibilityStatus = (t: TFunction, isDeltaEligible?: boolean) => {
  if (isDeltaEligible === undefined) {
    return t('Unknown');
  }
  return isDeltaEligible ? t('Eligible') : t('Not eligible');
};

const DeltaGenerationDescriptionGroups = ({ deviceStatus }: { deviceStatus: DeviceStatus | undefined }) => {
  const { t } = useTranslation();

  const { bootcVersion, ociDeltaVersion, deltaEligible } = deviceStatus?.systemInfo || {};

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>
          <LabelWithHelperText
            label={t('Delta generation')}
            content={t(
              'Delta updates download only the incremental changes between versions, reducing download size for updates. To receive delta updates, a device needs a compatible bootc version and the OCI delta package installed on its OS image.',
            )}
          />
        </DescriptionListTerm>
        <DescriptionListDescription aria-live="polite">
          {getEligibilityStatus(t, deltaEligible)}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {bootcVersion && (
        <DescriptionListGroup className="pf-v6-u-ml-md">
          <DescriptionListTerm>{t('Bootc version')}</DescriptionListTerm>
          <DescriptionListDescription>{bootcVersion}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {ociDeltaVersion && (
        <DescriptionListGroup className="pf-v6-u-ml-md">
          <DescriptionListTerm>{t('OCI delta version')}</DescriptionListTerm>
          <DescriptionListDescription>{ociDeltaVersion}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </>
  );
};

export const SystemInfoFieldsList = ({ entries }: { entries: SystemInfoEntry[] }) => (
  <SidebarDescriptionList isWide>
    {entries.map((entry) => (
      <SystemInfoDescriptionGroup key={entry.key} entry={entry} />
    ))}
  </SidebarDescriptionList>
);

export const CapabilitiesFieldsList = ({ deviceStatus }: { deviceStatus: DeviceStatus | undefined }) => {
  const { t } = useTranslation();

  const osModeCapability = getDeviceCapability(deviceStatus?.capabilities, 'osMode');

  return (
    <SidebarDescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('OS mode')}</DescriptionListTerm>
        <DescriptionListDescription>
          <OsModeLabel osMode={osModeCapability} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DeltaGenerationDescriptionGroups deviceStatus={deviceStatus} />
    </SidebarDescriptionList>
  );
};

const defaultHorizontalTermWidthModifier = { default: '30ch', md: '20ch' };
const compactHorizontalTermWidthModifier = { default: '12ch' };

const SidebarDescriptionList = ({ children, isWide = false }: React.PropsWithChildren<{ isWide?: boolean }>) => (
  <DescriptionList
    isHorizontal
    isCompact
    horizontalTermWidthModifier={isWide ? defaultHorizontalTermWidthModifier : compactHorizontalTermWidthModifier}
  >
    {children}
  </DescriptionList>
);
export default SidebarDescriptionList;
