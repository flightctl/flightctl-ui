import * as React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { type DeviceCapabilities } from '@flightctl/types';

import type { SystemInfoEntry } from '../../../hooks/useDeviceSpecSystemInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import { getDeviceCapability } from '../../../utils/capabilities';
import { OsModeLabel } from '../../common/OsModeContent';

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

export const CapabilitiesFieldsList = ({ capabilities }: { capabilities: DeviceCapabilities | undefined }) => {
  const { t } = useTranslation();

  const osModeCapability = getDeviceCapability(capabilities, 'osMode');
  return (
    <SidebarDescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('OS mode')}</DescriptionListTerm>
        <DescriptionListDescription>
          <OsModeLabel osMode={osModeCapability} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </SidebarDescriptionList>
  );
};

export default SidebarDescriptionList;
