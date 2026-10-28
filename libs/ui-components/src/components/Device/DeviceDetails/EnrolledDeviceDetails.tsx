import * as React from 'react';
import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';

import { type Device } from '@flightctl/types';
import { useDeviceSystemInfo } from '../../../hooks/useDeviceSystemInfo';
import { useDeviceOverallHealth } from '../../../hooks/useDeviceOverallHealth';
import { useTranslation } from '../../../hooks/useTranslation';
import { useVulnerabilitiesEnabled } from '../../../hooks/useServicesEnabled';
import DeviceApplications from './DeviceApplications';
import DeviceHealthAlert from './DeviceHealthAlert';
import DeviceIdentityCard from './DeviceIdentityCard';
import DeviceInformationCard from './DeviceInformationCard';
import DeviceStatusCard from './DeviceStatusCard';
import DeviceSystemdUnits from './DeviceSystemdUnits';
import DeviceVulnerabilities from './DeviceVulnerabilities';
import DeviceCustomDataCard from './DeviceCustomDataCard';

import './EnrolledDeviceDetails.css';

type EnrolledDeviceDetailsProps = {
  device: Required<Device>;
  refetch: VoidFunction;
  canEdit: boolean;
};

const EnrolledDeviceDetails = ({
  device,
  refetch,
  canEdit,
  children,
}: React.PropsWithChildren<EnrolledDeviceDetailsProps>) => {
  const { t } = useTranslation();
  const deviceHealth = useDeviceOverallHealth(device);
  const [vulnerabilitiesEnabled, canListVulnerabilities] = useVulnerabilitiesEnabled();
  const showVulnerabilities = vulnerabilitiesEnabled && canListVulnerabilities;

  const fullSystemInfoResult = useDeviceSystemInfo(
    t,
    device.status?.systemInfo,
    device.status?.systemInfoStatus?.statuses,
    true,
  );
  const { systemInfo, customInfo } = fullSystemInfoResult;

  return (
    <Stack hasGutter>
      <DeviceHealthAlert
        deviceHealth={deviceHealth}
        systemInfoHasErrors={systemInfo.hasMainErrors || systemInfo.hasExpandErrors}
        customInfoHasErrors={customInfo.hasErrors}
      />
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
            <StackItem className="fctl-enrolled-device__systemd-wide">
              <DeviceSystemdUnits device={device} />
            </StackItem>
          </Stack>
        </GridItem>
        <GridItem lg={4}>
          <Stack hasGutter>
            <StackItem>
              <DeviceIdentityCard device={device} refetch={refetch} canEdit={canEdit}>
                {children}
              </DeviceIdentityCard>
            </StackItem>
            <StackItem>
              <DeviceInformationCard device={device} systemInfoResult={systemInfo} />
            </StackItem>
            {customInfo.entries.length > 0 && (
              <StackItem>
                <DeviceCustomDataCard customInfoResult={customInfo} />
              </StackItem>
            )}
          </Stack>
        </GridItem>
        <GridItem md={12} className="fctl-enrolled-device__systemd-narrow">
          <DeviceSystemdUnits device={device} />
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default EnrolledDeviceDetails;
