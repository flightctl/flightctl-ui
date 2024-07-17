import * as React from 'react';
import { Icon, Spinner } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { Fleet, FleetList } from '@flightctl/types';
import { FlightCtlLabel } from '../types/extraTypes';
import { useFetch } from './useFetch';
import { useTranslation } from './useTranslation';
import { getErrorMessage } from '../utils/error';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons';

export type DeviceMatchStatus = {
  status:
    | 'unchecked'
    | 'unchecked--invalid'
    | 'checking'
    | 'checked--error'
    | 'checked--unique'
    | 'checked--multiple'
    | 'checked--empty';
  detail?: string;
};

const getMatchResult = (fleets: Fleet[], deviceLabels: FlightCtlLabel[]): DeviceMatchStatus => {
  const matchingFleets = fleets.filter((fleet) => {
    const fleetMatch = fleet.spec.selector?.matchLabels || {};
    return Object.entries(fleetMatch).every(([fleetMatchKey, fleetMatchValue]) => {
      const matchingDeviceLabel = deviceLabels.find((dLabel) => dLabel.key === fleetMatchKey);
      return matchingDeviceLabel && (matchingDeviceLabel.value || '') === (fleetMatchValue || '');
    });
  });

  const matchCount = matchingFleets?.length || 0;

  switch (matchCount) {
    case 0:
      return { status: 'checked--empty' };
    case 1:
      return { status: 'checked--unique', detail: matchingFleets[0].metadata.name };
    default:
      return { status: 'checked--multiple' };
  }
};

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
    <div className="fctl_approve-device__fleetname">
      {icon && <span className="fctl_approve-device__fleetname__icon">{icon}</span>}
      <span className={isPlaceholder ? 'fctl_approve-device__fleetname__placeholder' : ''}>{text}</span>
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
      const text = t('Failed to obtain matching fleet(s): {{errorMessage}}', {
        errorMessage: matchStatus.detail || t('Unknown error'),
      });
      return <DeviceLabelMatchContent iconStatus="danger" text={text} />;
    }
  }
};

type MatchLabelsFn = (labels: FlightCtlLabel[], hasErrors: boolean) => void;

const useDeviceLabelMatch = (): [MatchLabelsFn, DeviceMatchStatus] => {
  const { get } = useFetch();
  const currentErrorRef = React.useRef<boolean>();
  const abortControllerRef = React.useRef<AbortController>();

  const [matchStatus, setMatchStatus] = React.useState<DeviceMatchStatus>({
    status: 'unchecked',
    detail: '',
  });

  const matchLabelsFn = React.useCallback(
    (newLabels: FlightCtlLabel[], hasErrors: boolean) => {
      const matchDeviceLabels = async () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // TODO PoC implementation, we're missing the ability of filtering in the "fleets" endpoint.
        let result: DeviceMatchStatus;
        try {
          const allFleets = await get<FleetList>('fleets', abortControllerRef.current.signal);
          currentErrorRef.current = true;

          result = getMatchResult(allFleets.items ?? [], newLabels);
        } catch (e) {
          currentErrorRef.current = false;
          result = { status: 'checked--error', detail: getErrorMessage(e) };
        }
        setMatchStatus(result);
      };
      if (newLabels.length === 0) {
        setMatchStatus({
          status: 'unchecked',
        });
      } else if (hasErrors) {
        setMatchStatus({
          status: 'unchecked--invalid',
        });
      } else {
        void matchDeviceLabels();
      }
    },
    [get],
  );

  return [matchLabelsFn, matchStatus];
};

export default useDeviceLabelMatch;
