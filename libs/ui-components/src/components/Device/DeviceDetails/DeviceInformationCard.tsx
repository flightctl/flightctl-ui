import * as React from 'react';
import {
  CardBody,
  Divider,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { AddressCardIcon } from '@patternfly/react-icons/dist/js/icons/address-card-icon';

import { type Device } from '@flightctl/types';
import { type SystemInfoSplitResult } from '../../../hooks/useDeviceSystemInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import DetailsPageCard, { DetailsPageCardTitle, deviceCardIds } from '../../DetailsPage/DetailsPageCard';
import ConfigurationsContent from './DeviceDetailsTabContent/ConfigurationsContent';
import { CapabilitiesFieldsList, SystemInfoFieldsList } from './SidebarDescriptionList';
import SystemInfoReportingBadge from './SystemInfoReportingBadge';

import './DeviceDetailsTab.css';

const DeviceInformationCard = ({
  device,
  systemInfoResult,
}: {
  device: Required<Device>;
  systemInfoResult: SystemInfoSplitResult;
}) => {
  const { t } = useTranslation();
  const [isMoreInfoExpanded, setIsMoreInfoExpanded] = React.useState(false);

  const hasAnyErrors = systemInfoResult.hasMainErrors || systemInfoResult.hasExpandErrors;

  return (
    <DetailsPageCard id={deviceCardIds.systemInfo}>
      <DetailsPageCardTitle
        title={t('Device information')}
        icon={<AddressCardIcon />}
        badge={<SystemInfoReportingBadge hasErrors={hasAnyErrors} />}
      />
      <CardBody>
        <Stack hasGutter>
          {systemInfoResult.mainEntries.length > 0 && (
            <StackItem>
              <SystemInfoFieldsList entries={systemInfoResult.mainEntries} />
            </StackItem>
          )}
          {systemInfoResult.expandEntries.length > 0 && (
            <StackItem>
              <ExpandableSection
                toggleContent={
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>{isMoreInfoExpanded ? t('Hide full system info') : t('Show full system info')}</FlexItem>
                    {!isMoreInfoExpanded && systemInfoResult.hasExpandErrors && (
                      <FlexItem>
                        <Label isCompact status="warning">
                          {t('Stale values below')}
                        </Label>
                      </FlexItem>
                    )}
                  </Flex>
                }
                onToggle={(_event, expanded) => setIsMoreInfoExpanded(expanded)}
                isExpanded={isMoreInfoExpanded}
              >
                <SystemInfoFieldsList entries={systemInfoResult.expandEntries} />
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
            <CapabilitiesFieldsList deviceStatus={device.status} />
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

export default DeviceInformationCard;
