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
import { useDevices } from '../../../Device/DevicesPage/useDevices';

const StatusCard = () => {
  const { t } = useTranslation();
  const [fleets, setFleets] = React.useState<string[]>([]);
  const [labels, setLabels] = React.useState<FlightCtlLabel[]>([]);

  const [devices, loading, error, , , allLabels] = useDevices({
    ownerFleets: fleets,
    labels,
  });

  const [fleetsList, flLoading, flError] = useFetchPeriodically<FleetList>({
    endpoint: 'fleets',
  });

  let content: React.ReactNode;
  if (loading || flLoading) {
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
            <Text component={TextVariants.small}>{t('{{count}} Devices', { count: devices.length || 0 })}</Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Flex justifyContent={{ default: 'justifyContentSpaceAround' }}>
            <FlexItem>
              <ApplicationStatusChart resources={devices} labels={labels} fleets={fleets} />
            </FlexItem>
            <FlexItem>
              <DeviceStatusChart resources={devices} labels={labels} fleets={fleets} />
            </FlexItem>
            <FlexItem>
              <SystemUpdateStatusChart resources={devices} labels={labels} fleets={fleets} />
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
