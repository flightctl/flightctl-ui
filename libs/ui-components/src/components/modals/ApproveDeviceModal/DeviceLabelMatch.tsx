import * as React from 'react';
import { Icon, Spinner } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceMatchStatus } from '../../../hooks/useDeviceLabelMatch';

import './DeviceLabelMatch.css';

const DeviceLabelMatchContent = ({
  iconStatus,
  text,
  isPlaceholder,
}: {
  iconStatus?: 'success' | 'warning' | 'danger' | 'loader';
  text?: string;
  isPlaceholder?: boolean;
}) => {
  let icon: React.ReactNode;
  switch (iconStatus) {
    case 'warning':
      icon = (
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      );
      break;
    case 'danger':
      icon = (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      );
      break;
    case 'success':
      icon = (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      );
      break;
    case 'loader':
      icon = <Spinner size="sm" />;
      break;
  }

  return (
    <div className="fctl-device-label-match">
      {icon && <span className="fctl-device-label-match__icon">{icon}</span>}
      <span className={isPlaceholder ? 'fctl-device-label-match__placeholder' : ''}>{text}</span>
    </div>
  );
};

export const DeviceLabelMatch = ({ matchStatus }: { matchStatus: DeviceMatchStatus }) => {
  const { t } = useTranslation();

  switch (matchStatus.status) {
    case 'unchecked':
      return <DeviceLabelMatchContent text={t('Add labels to select a fleet.')} isPlaceholder />;
    case 'unchecked--invalid':
      return (
        <DeviceLabelMatchContent
          iconStatus="warning"
          text={t('Fleet label match cannot cannot be evaluated when there are invalid labels.')}
          isPlaceholder
        />
      );
    case 'checking':
      return <DeviceLabelMatchContent iconStatus="loader" />;
    case 'checked--unique':
      return (
        <DeviceLabelMatchContent
          iconStatus="success"
          /* The matching fleet's name */
          text={matchStatus.detail}
        />
      );
    case 'checked--empty':
      return <DeviceLabelMatchContent iconStatus="warning" text={t('No fleet is matching the selected labels.')} />;
    case 'checked--multiple':
      return (
        <DeviceLabelMatchContent
          iconStatus="danger"
          text={t(
            "More than one fleet is matching the selected labels. The device will ignore the fleets' configurations.",
          )}
        />
      );
    case 'checked--error': {
      const text = t('Check for matching fleet(s) failed. {{errorMessage}}', {
        errorMessage: matchStatus.detail || t('Unknown error'),
      });
      return <DeviceLabelMatchContent iconStatus="danger" text={text} />;
    }
  }
};

export default DeviceLabelMatch;
