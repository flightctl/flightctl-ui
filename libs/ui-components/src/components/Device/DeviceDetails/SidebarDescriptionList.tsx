import * as React from 'react';
import type { TFunction } from 'react-i18next';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { type DeviceStatus } from '@flightctl/types';

import type { SystemInfoEntry } from '../../../hooks/useDeviceSpecSystemInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import { getDeviceCapability } from '../../../utils/capabilities';
import { OsModeLabel } from '../../common/OsModeContent';
import LabelWithHelperText from '../../common/WithHelperText';

const getEligibilityStatus = (t: TFunction, isDeltaEligible?: boolean) => {
  if (isDeltaEligible) {
    return t('Eligible');
  }
  return isDeltaEligible === undefined ? t('Unknown') : t('Not eligible');
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
        <DescriptionListDescription>{getEligibilityStatus(t, deltaEligible)}</DescriptionListDescription>
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

const SidebarDescriptionList = ({ children }: React.PropsWithChildren) => (
  <DescriptionList isHorizontal isCompact horizontalTermWidthModifier={{ default: '12ch' }}>
    {children}
  </DescriptionList>
);

export const SystemInfoFieldsList = ({ fields }: { fields: SystemInfoEntry[] }) => {
  return (
    <SidebarDescriptionList>
      {fields.map((field, index) => (
        <DescriptionListGroup key={index}>
          <DescriptionListTerm>{field.title}</DescriptionListTerm>
          <DescriptionListDescription>{field.value}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </SidebarDescriptionList>
  );
};

export default SidebarDescriptionList;
