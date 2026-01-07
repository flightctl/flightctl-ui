import * as React from 'react';
import { TFunction } from 'react-i18next';

import { Icon, Stack, StackItem } from '@patternfly/react-core';
import {
  DeviceIntegrityCheckStatusType,
  DeviceIntegrityStatus,
  DeviceIntegrityStatusSummaryType,
} from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { getIntegrityStatusItems, integrityCheckToSummaryType } from '../../utils/status/integrity';
import { StatusItem, getDefaultStatusColor } from '../../utils/status/common';
import { getDefaultStatusIcon } from '../../utils/status/common';
import { getDateDisplay } from '../../utils/dates';
import StatusDisplay from './StatusDisplay';

const getIntegrityCheckItem = (
  t: TFunction,
  statusItems: StatusItem<DeviceIntegrityStatusSummaryType>[],
  statusField: { status: DeviceIntegrityCheckStatusType; info?: string },
  key: string,
): React.ReactNode => {
  const statusType = integrityCheckToSummaryType(statusField.status);
  const levelItem = statusItems.find((statusItem) => statusItem.id === statusType) || {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown,
    label: t('Unknown'),
    level: 'unknown' as const,
  };

  const IconComponent = levelItem.customIcon || getDefaultStatusIcon(levelItem.level);
  const iconStatus = levelItem.level === 'unknown' ? undefined : levelItem.level;

  const label =
    key === 'device-identity'
      ? t('Device identity - {{ status }}', { status: levelItem.label })
      : t('TPM - {{ status }}', { status: levelItem.label });

  return (
    <StackItem key={key}>
      <Icon
        status={iconStatus}
        style={{ '--pf-v6-c-icon__content--Color': getDefaultStatusColor(levelItem.level) } as React.CSSProperties}
      >
        <IconComponent />
      </Icon>{' '}
      {label}
      {statusField.info ? `: ${statusField.info}` : ''}
    </StackItem>
  );
};

export const getIntegrityExtraDetails = (
  t: TFunction,
  integrityStatus: DeviceIntegrityStatus,
  statusItems: StatusItem<DeviceIntegrityStatusSummaryType>[],
): React.ReactNode | undefined => {
  if (!integrityStatus) {
    return undefined;
  }

  const extraDetails: React.ReactNode[] = [];

  const deviceIdentity = integrityStatus.deviceIdentity;
  if (deviceIdentity) {
    extraDetails.push(getIntegrityCheckItem(t, statusItems, deviceIdentity, 'device-identity'));
  }

  const tpm = integrityStatus.tpm;
  if (tpm) {
    extraDetails.push(getIntegrityCheckItem(t, statusItems, tpm, 'tpm'));
  }

  return extraDetails.length > 0 ? <Stack hasGutter>{extraDetails}</Stack> : undefined;
};

const IntegrityStatus = ({ integrityStatus }: { integrityStatus?: DeviceIntegrityStatus }) => {
  const { t } = useTranslation();

  // Show unknown status if we don't receive any information
  if (!integrityStatus) {
    return <StatusDisplay />;
  }

  const statusItems = getIntegrityStatusItems(t);
  const item = statusItems.find((statusItem) => {
    return statusItem.id === (integrityStatus.status || DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown);
  });

  let message: React.ReactNode = integrityStatus.info || '';

  const extraDetails = item ? getIntegrityExtraDetails(t, integrityStatus, statusItems) : undefined;
  if (extraDetails) {
    message = (
      <Stack hasGutter>
        {integrityStatus.info && <StackItem>{integrityStatus.info}</StackItem>}
        <StackItem>{extraDetails}</StackItem>
        {integrityStatus.lastVerified && (
          <StackItem>
            <small>
              {t('Last verification at: {{ timestamp }}', {
                timestamp: getDateDisplay(integrityStatus.lastVerified),
              })}
            </small>
          </StackItem>
        )}
      </Stack>
    );
  }
  return <StatusDisplay item={item} message={message} />;
};

export default IntegrityStatus;
