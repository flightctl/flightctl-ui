import React from 'react';

import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';

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
      title={`${totalDevices}`}
      themeColor={ChartThemeColor.multiUnordered}
      width={350}
      height={300}
    />
  );
};

export { DevicesDonuts };
