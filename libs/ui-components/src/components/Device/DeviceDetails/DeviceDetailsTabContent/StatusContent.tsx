import * as React from 'react';
import {
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { timeSinceText } from '../../../../utils/dates';
import { useTranslation } from '../../../../hooks/useTranslation';
import DetailsPageCard, { DetailsPageCardBody } from '../../../DetailsPage/DetailsPageCard';
import FlightControlDescriptionList from '../../../common/FlightCtlDescriptionList';
import WithHelperText from '../../../common/WithHelperText';
import ApplicationSummaryStatus from '../../../Status/ApplicationSummaryStatus';
import DeviceStatus from '../../../Status/DeviceStatus';
import SystemUpdateStatus from '../../../Status/SystemUpdateStatus';

const StatusContent = ({ device }: { device: Required<Device> }) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <CardTitle>{t('System status')}</CardTitle>
      <DetailsPageCardBody>
        <FlightControlDescriptionList columnModifier={{ default: '3Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <WithHelperText
                content={t('Indicates the overall status of application workloads on the device.')}
                ariaLabel={t('Application status')}
                showLabel
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              <ApplicationSummaryStatus statusSummary={device.status.applicationsSummary} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <WithHelperText
                content={t('Indicates the overall status of the device hardware and operating system.')}
                ariaLabel={t('Device status')}
                showLabel
              />{' '}
            </DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceStatus deviceStatus={device.status} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <WithHelperText
                content={t(
                  'Indicates whether a system is running the latest target configuration or is updating towards it.',
                )}
                ariaLabel={t('Update status')}
                showLabel
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              <SystemUpdateStatus deviceStatus={device.status} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Last seen')}</DescriptionListTerm>
            <DescriptionListDescription>{timeSinceText(t, device.status.lastSeen)}</DescriptionListDescription>
          </DescriptionListGroup>
        </FlightControlDescriptionList>
      </DetailsPageCardBody>
    </DetailsPageCard>
  );
};

export default StatusContent;
