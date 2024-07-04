import {
  Alert,
  Bullseye,
  Card,
  CardBody,
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
import * as React from 'react';
import { DeviceList } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';
import ApplicationStatusChart from './Cards/Status/ApplicationStatusChart';
import DeviceStatusChart from './Cards/Status/DeviceStatusChart';
import SystemUpdateStatusChart from './Cards/Status/SystemUpdateStatusChart';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';

const Overview = () => {
  const { t } = useTranslation();

  const [devicesList, loading, error] = useFetchPeriodically<DeviceList>({
    endpoint: 'devices',
  });

  if (loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }
  if (error) {
    return <Alert variant="danger" isInline title={getErrorMessage(error)} />;
  }

  return (
    <Card>
      <CardTitle>{t('Status')}</CardTitle>
      <CardBody>
        <Stack>
          <StackItem>
            <TextContent>
              <Text component={TextVariants.small}>
                {t('{{count}} Devices', { count: devicesList?.items.length || 0 })}
              </Text>
            </TextContent>
          </StackItem>
          {!!devicesList?.items.length && (
            <StackItem>
              <Flex justifyContent={{ default: 'justifyContentSpaceAround' }}>
                <FlexItem>
                  <ApplicationStatusChart resources={devicesList.items} />
                </FlexItem>
                <FlexItem>
                  <DeviceStatusChart resources={devicesList.items} />
                </FlexItem>
                <FlexItem>
                  <SystemUpdateStatusChart resources={devicesList.items} />
                </FlexItem>
              </Flex>
            </StackItem>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default Overview;
