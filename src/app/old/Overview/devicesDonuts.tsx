import React from 'react';

import { ChartDonut, ChartLabel, ChartThemeColor } from '@patternfly/react-charts';
import { ChartCommonStyles } from '@patternfly/react-charts/src/components/ChartTheme/ChartStyles';

type DeviceStatusType = 'Ready' | 'Error' | 'Syncing' | 'Offline' | 'Degraded';


type FleetDevicesStatus = Record<DeviceStatusType, {
  count: number;
}>

const DevicesDonuts = ({
  totalDevices,
  fleetDevicesStatus
                       } : {
  totalDevices: number,
  fleetDevicesStatus: FleetDevicesStatus
}) => {
  return (
    <ChartDonut
      ariaDesc="Devices"
      ariaTitle="Devices"
      constrainToVisibleArea
      data={Object.entries(fleetDevicesStatus).map(([statusType, statusInfo]) => {
        return { x: statusType, y: statusInfo.count }
      })}
      labels={({ datum }) => `${datum.x}: ${datum.y}`}
      name="chart3"
      colorScale={['limegreen', 'tomato', 'khaki',  'cornflowerblue', 'gainsboro']}
      padding={{
        bottom: 65,
        right: 20, // Adjusted to accommodate legend
        top: 20,
      }}
      subTitle="Devices"
      /* Setting a color that works well with both "dark/light" themes */
      titleComponent={<ChartLabel style={{ fill: 'var(--pf-v5-global--primary-color--100' }} />}
      title={`${totalDevices}`}
      themeColor={ChartThemeColor.multiUnordered}
      width={350}
      height={300}
    />
  );
};

export { DevicesDonuts };
