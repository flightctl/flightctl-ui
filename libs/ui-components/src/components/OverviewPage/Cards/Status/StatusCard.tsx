import * as React from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { useTranslation } from '../../../../hooks/useTranslation';
import ApplicationStatusChart from './ApplicationStatusChart';
import DeviceStatusChart from './DeviceStatusChart';
import SystemUpdateStatusChart from './SystemUpdateStatusChart';
import StatusCardFilters from './StatusCardFilters';
import ErrorAlert from '../../../ErrorAlert/ErrorAlert';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import { useDevicesSummary } from '../../../Device/DevicesPage/useDevices';

const StatusCard = () => {
  const { t } = useTranslation();
  const [fleets, setFleets] = React.useState<string[]>([]);
  const [labels, setLabels] = React.useState<FlightCtlLabel[]>([]);

  const [devicesSummary, summaryLoading] = useDevicesSummary({
    ownerFleets: fleets,
    labels,
  });

  const error = false;

  let content: React.ReactNode;
  if (summaryLoading) {
    content = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (error) {
    content = <ErrorAlert error={error} />;
  } else {
    content = (
      <Stack>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.small}>{t('{{count}} Devices', { count: devicesSummary?.total || 0 })}</Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Flex justifyContent={{ default: 'justifyContentSpaceAround' }}>
            <FlexItem>
              <ApplicationStatusChart
                applicationStatus={devicesSummary?.applicationStatus || {}}
                labels={labels}
                fleets={fleets}
              />
            </FlexItem>
            <FlexItem>
              <DeviceStatusChart deviceStatus={devicesSummary?.summaryStatus || {}} labels={labels} fleets={fleets} />
            </FlexItem>
            <FlexItem>
              <SystemUpdateStatusChart
                updatedStatus={devicesSummary?.updateStatus || {}}
                labels={labels}
                fleets={fleets}
              />
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <CardTitle>{t('Status')}</CardTitle>
          </FlexItem>
          <FlexItem>
            <StatusCardFilters
              selectedFleets={fleets}
              setSelectedFleets={setFleets}
              selectedLabels={labels}
              setSelectedLabels={setLabels}
            />
          </FlexItem>
        </Flex>
      </CardHeader>

      <CardBody>{content}</CardBody>
    </Card>
  );
};

export default StatusCard;
