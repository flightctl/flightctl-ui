import * as React from 'react';
import { CardBody, Label, Stack, StackItem, Title } from '@patternfly/react-core';
import TachometerAltIcon from '@patternfly/react-icons/dist/js/icons/tachometer-alt-icon';

import type { Device } from '@flightctl/types';
import type { DeviceHealthItem } from '../../../hooks/useDeviceOverallHealth';
import { useTranslation } from '../../../hooks/useTranslation';
import DetailsPageCard, { DetailsPageCardTitle } from '../../DetailsPage/DetailsPageCard';
import StatusContent from './DeviceDetailsTabContent/StatusContent';
import SystemResourcesContent from './DeviceDetailsTabContent/SystemResourcesContent';

const DEVICE_STATUS_CARD_ID = 'device-status-card';

const DeviceStatusCard = ({ device, health }: { device: Required<Device>; health: DeviceHealthItem }) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard id={DEVICE_STATUS_CARD_ID}>
      <DetailsPageCardTitle
        title={t('Status')}
        icon={<TachometerAltIcon />}
        badge={
          health.level !== null && (
            <Label status={health.level}>{t('{{count}} status issues', { count: health.itemCount })}</Label>
          )
        }
      />
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h3" size="md">
                  {t('System status')}
                </Title>
              </StackItem>
              <StackItem>
                <StatusContent device={device} />
              </StackItem>
            </Stack>
          </StackItem>
          <StackItem>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h3" size="md">
                  {t('Resource status')}
                </Title>
              </StackItem>
              <StackItem>
                <SystemResourcesContent device={device} />
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceStatusCard;
