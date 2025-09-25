import * as React from 'react';
import {
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { Device, DeviceLastSeen } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import DetailsPageCard, { DetailsPageCardBody } from '../../../DetailsPage/DetailsPageCard';
import FlightControlDescriptionList from '../../../common/FlightCtlDescriptionList';
import LabelWithHelperText from '../../../common/WithHelperText';
import ApplicationSummaryStatus from '../../../Status/ApplicationSummaryStatus';
import DeviceStatus from '../../../Status/DeviceStatus';
import SystemUpdateStatus from '../../../Status/SystemUpdateStatus';
import IntegrityStatus from '../../../Status/IntegrityStatus';
import { timeSinceText } from '../../../../utils/dates';

const LAST_SEEN_REFRESH_INTERVAL = 60 * 1000; // 1 minute

const StatusContent = ({ device }: { device: Required<Device> }) => {
  const { t } = useTranslation();

  const [lastSeenResponse] = useFetchPeriodically<DeviceLastSeen>({
    endpoint: `devices/${device.metadata.name}/lastseen`,
    timeout: LAST_SEEN_REFRESH_INTERVAL,
  });

  return (
    <DetailsPageCard>
      <CardTitle>{t('System status')}</CardTitle>
      <DetailsPageCardBody>
        <FlightControlDescriptionList columnModifier={{ default: '3Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <LabelWithHelperText
                label={t('Application status')}
                content={t('Indicates the overall status of application workloads on the device.')}
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              <ApplicationSummaryStatus statusSummary={device.status.applicationsSummary} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <LabelWithHelperText
                label={t('Device status')}
                content={t('Indicates the overall status of the device hardware and operating system.')}
              />{' '}
            </DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceStatus deviceStatus={device.status} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <LabelWithHelperText
                label={t('Update status')}
                content={t(
                  'Indicates whether a system is running the latest target configuration or is updating towards it.',
                )}
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              <SystemUpdateStatus deviceStatus={device.status} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <LabelWithHelperText
                label={t('Integrity status')}
                content={t('Indicates whether the device has been verified as secure and authentic.')}
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              <IntegrityStatus integrityStatus={device.status.integrity} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Last seen')}</DescriptionListTerm>
            <DescriptionListDescription>{timeSinceText(t, lastSeenResponse?.lastSeen)}</DescriptionListDescription>
          </DescriptionListGroup>
        </FlightControlDescriptionList>
      </DetailsPageCardBody>
    </DetailsPageCard>
  );
};

export default StatusContent;
