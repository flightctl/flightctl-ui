import React, { useState, useEffect } from 'react';
import { fetchData } from '@app/old/utils/commonFunctions';
import { useAuth } from 'react-oidc-context';
import {
  Card,
  CardBody,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  Divider,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  PageSection,
  Title,
  CardHeader,
} from '@patternfly/react-core';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
const DevicesDonuts: React.FunctionComponent = () => {
    return (
        <ChartDonut
                ariaDesc="Devices"
                ariaTitle="Devices"
                constrainToVisibleArea
                data={[{ x: 'Ready', y: 720 }, { x: 'Error', y: 100 }, { x: 'Offline', y: 110 }, { x: 'Degraded', y: 60 }]}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                name="chart3"
                colorScale={['limegreen', 'tomato', 'gainsboro', 'khaki']}
                padding={{
                  bottom: 65,
                  right: 20, // Adjusted to accommodate legend
                  top: 20
                }}
                subTitle="Devices"
                title="1000"
                themeColor={ChartThemeColor.multiUnordered}
                width={350}
                height={300}
              />
    );
}

export { DevicesDonuts };