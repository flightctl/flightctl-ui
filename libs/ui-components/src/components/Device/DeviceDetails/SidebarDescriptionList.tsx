import * as React from 'react';
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
import DeviceDeltaUpdateDetails from './DeviceDeltaUpdateDetails';

const DeltaDescriptionGroupItem = ({ deviceStatus }: { deviceStatus: DeviceStatus | undefined }) => {
  const { t } = useTranslation();
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        <LabelWithHelperText
          label={t('Delta eligibility')}
          content={t(
            'Whether this device can apply incremental OCI delta updates. Requires bootc and the oci-delta tool on the device',
          )}
        />
      </DescriptionListTerm>
      <DescriptionListDescription>
        <DeviceDeltaUpdateDetails deviceStatus={deviceStatus} />
      </DescriptionListDescription>
    </DescriptionListGroup>
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
      <DeltaDescriptionGroupItem deviceStatus={deviceStatus} />
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
