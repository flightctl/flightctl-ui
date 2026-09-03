import * as React from 'react';
import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';

import { type Device } from '@flightctl/types';
import { useDeviceOverallHealth } from '../../../hooks/useDeviceOverallHealth';
import { useVulnerabilitiesEnabled } from '../../../hooks/useServicesEnabled';
import DeviceInformationCard from './DeviceInformationCard';
import DeviceSpecificationsCard from './DeviceSpecificationsCard';
import DeviceCustomDataCard from './DeviceCustomDataCard';
import DeviceStatusCard from './DeviceStatusCard';
import DeviceApplications from './DeviceApplications';
import DeviceVulnerabilities from './DeviceVulnerabilities';
import DeviceSystemdUnits from './DeviceSystemdUnits';
import DeviceHealthAlert from './DeviceHealthAlert';

import './DeviceDetailsTab.css';

type DeviceOverviewLayoutProps = {
  device: Required<Device>;
  refetch: VoidFunction;
  canEdit: boolean;
};

const DeviceOverviewLayout = ({
  device,
  refetch,
  canEdit,
  children,
}: React.PropsWithChildren<DeviceOverviewLayoutProps>) => {
  const deviceHealth = useDeviceOverallHealth(device);
  const [vulnerabilitiesEnabled, canListVulnerabilities] = useVulnerabilitiesEnabled();
  const showVulnerabilities = vulnerabilitiesEnabled && canListVulnerabilities;

  const customInfo = Object.entries<string>(device.status?.systemInfo?.customInfo || {});

  return (
    <Stack hasGutter>
      <DeviceHealthAlert deviceHealth={deviceHealth} />
      <Grid hasGutter>
        <GridItem lg={8}>
          <Stack hasGutter>
            <StackItem>
              <DeviceStatusCard device={device} health={deviceHealth.statusHealth} />
            </StackItem>
            <StackItem>
              <DeviceApplications device={device} health={deviceHealth.appsHealth} refetch={refetch} />
            </StackItem>
            {showVulnerabilities && (
              <StackItem>
                <DeviceVulnerabilities deviceId={device.metadata.name as string} />
              </StackItem>
            )}
            <StackItem className="fctl-device-overview__systemd-wide">
              <DeviceSystemdUnits device={device} />
            </StackItem>
          </Stack>
        </GridItem>
        <GridItem lg={4}>
          <Stack hasGutter>
            <StackItem>
              <DeviceInformationCard device={device} refetch={refetch} canEdit={canEdit}>
                {children}
              </DeviceInformationCard>
            </StackItem>
            <StackItem>
              <DeviceSpecificationsCard device={device} />
            </StackItem>
            {customInfo.length > 0 && (
              <StackItem>
                <DeviceCustomDataCard customInfo={customInfo} />
              </StackItem>
            )}
          </Stack>
        </GridItem>
        <GridItem md={12} className="fctl-device-overview__systemd-narrow">
          <DeviceSystemdUnits device={device} />
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default DeviceOverviewLayout;
