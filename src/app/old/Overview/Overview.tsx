import React from 'react';
import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  Divider,
  PageSection,
  Title,
  CardHeader,
} from '@patternfly/react-core';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { deviceList } from '@app/old/utils/commonDataTypes';
import { DevicesDonuts } from './devicesDonuts';
import { DevicesGrid } from './devicesGrid';
import { Filter } from './filter';
import { Legend } from './legend';

const fakeDevicesStatus = {
  'Ready': { count: 720 },
  'Error': { count: 63 },
  'Syncing': { count: 102 },
  'Offline': { count: 85 },
  'Degraded': { count: 30 },
}

const Overview: React.FunctionComponent = () => {
  const [data] = useFetchPeriodically<deviceList>({ endpoint: 'devices' });

  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Overview</Title>

      <Card isCompact={true} isFlat={true} >
        <CardHeader>
        <table>
        <tbody>
          <tr>
            <td>
              <Filter />
            </td>
          </tr>
        </tbody>
      </table>
        </CardHeader>
        <CardBody>
            <Flex alignItems={{ default: "alignItemsCenter" }} justifyContent={{ default: 'justifyContentSpaceAround' }} >
            {!!data && (
              <FlexItem>
                <DevicesGrid data={data}></DevicesGrid>
              </FlexItem>
            )}
            <Divider
              orientation={{
                default: 'vertical'
              }}
              inset={{ default: 'insetSm' }}
            />
            <FlexItem>
              <DevicesDonuts fleetDevicesStatus={fakeDevicesStatus} totalDevices={1000}></DevicesDonuts>
            </FlexItem>
          </Flex>
          <br></br><br></br>
              <Legend />

        </CardBody>
      </Card>

    </PageSection>
  )
};

export { Overview }
