import * as React from 'react';
import { CardBody, Divider, ExpandableSection, Stack, StackItem, Title } from '@patternfly/react-core';
import { AddressCardIcon } from '@patternfly/react-icons/dist/js/icons/address-card-icon';

import { type Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDeviceSpecSystemInfo } from '../../../hooks/useDeviceSpecSystemInfo';
import DetailsPageCard, { DetailsPageCardTitle } from '../../DetailsPage/DetailsPageCard';
import ConfigurationsContent from './DeviceDetailsTabContent/ConfigurationsContent';
import { CapabilitiesFieldsList, SystemInfoFieldsList } from './SidebarDescriptionList';

import './DeviceDetailsTab.css';

// By default only show the first 4 fields, with the rest shown in an expandable section
// However, if there are less than 8 fields, show all of them without needing to expand
const EXPAND_SYSTEM_INFO_COUNT = 4;
const MIN_SYSTEM_INFO_FIELDS_FOR_EXPAND = 8;

const DeviceSpecificationsCard = ({ device }: { device: Required<Device> }) => {
  const { t } = useTranslation();
  const systemInfoFields = useDeviceSpecSystemInfo(device.status?.systemInfo, t);

  const [showMoreSystemInfo, setShowMoreSystemInfo] = React.useState(false);

  const { visibleSystemInfoFields, expandableSystemInfoFields } = React.useMemo(() => {
    if (systemInfoFields.length < MIN_SYSTEM_INFO_FIELDS_FOR_EXPAND) {
      return {
        visibleSystemInfoFields: systemInfoFields,
        expandableSystemInfoFields: [],
      };
    }

    return {
      visibleSystemInfoFields: systemInfoFields.slice(0, EXPAND_SYSTEM_INFO_COUNT),
      expandableSystemInfoFields: systemInfoFields.slice(EXPAND_SYSTEM_INFO_COUNT),
    };
  }, [systemInfoFields]);

  return (
    <DetailsPageCard>
      <DetailsPageCardTitle title={t('Device specifications')} icon={<AddressCardIcon />} />
      <CardBody>
        <Stack hasGutter>
          {visibleSystemInfoFields.length > 0 && (
            <StackItem>
              <SystemInfoFieldsList fields={visibleSystemInfoFields} />
            </StackItem>
          )}
          {expandableSystemInfoFields.length > 0 && (
            <StackItem>
              <ExpandableSection
                toggleText={showMoreSystemInfo ? t('Hide full system info') : t('Show full system info')}
                onToggle={(_event, expanded) => setShowMoreSystemInfo(expanded)}
                isExpanded={showMoreSystemInfo}
              >
                <SystemInfoFieldsList fields={expandableSystemInfoFields} />
              </ExpandableSection>
            </StackItem>
          )}
          <StackItem>
            <Divider />
          </StackItem>
          <StackItem>
            <Title headingLevel="h3" size="md">
              {t('Capabilities')}
            </Title>
          </StackItem>
          <StackItem>
            <CapabilitiesFieldsList capabilities={device.status?.capabilities} />
          </StackItem>
          <StackItem>
            <Divider />
          </StackItem>
          <StackItem>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h3" size="md">
                  {t('Configurations')}
                </Title>
              </StackItem>
              <StackItem>
                <ConfigurationsContent device={device} />
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceSpecificationsCard;
