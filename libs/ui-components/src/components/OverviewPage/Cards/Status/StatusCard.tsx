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
import { FleetList } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import ApplicationStatusChart from './ApplicationStatusChart';
import DeviceStatusChart from './DeviceStatusChart';
import SystemUpdateStatusChart from './SystemUpdateStatusChart';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import StatusCardFilters from './StatusCardFilters';
import ErrorAlert from '../../../ErrorAlert/ErrorAlert';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import { useDevices, useDevicesSummary } from '../../../Device/DevicesPage/useDevices';

const StatusCard = () => {
  const { t } = useTranslation();
  const [fleets, setFleets] = React.useState<string[]>([]);
  const [labels, setLabels] = React.useState<FlightCtlLabel[]>([]);

  const [devicesSummary, summaryLoading] = useDevicesSummary({
    ownerFleets: fleets,
    labels,
  });

  // TODO https://issues.redhat.com/browse/EDM-684 Use the new API endpoint to retrieve device labels
  const [, /* devices */ loading, error, , , allLabels] = useDevices({
    ownerFleets: fleets,
    labels,
  });

  // TODO https://issues.redhat.com/browse/EDM-683 Use the new API endpoint to retrieve fleet names
  const [fleetsList, flLoading, flError] = useFetchPeriodically<FleetList>({
    endpoint: 'fleets?sortBy=metadata.name&sortOrder=Asc',
  });

  let content: React.ReactNode;
  if (loading || flLoading || summaryLoading) {
    content = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (error || flError) {
    content = <ErrorAlert error={error || flError} />;
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
              fleets={fleetsList?.items || []}
              selectedFleets={fleets}
              setSelectedFleets={setFleets}
              allLabels={allLabels}
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
