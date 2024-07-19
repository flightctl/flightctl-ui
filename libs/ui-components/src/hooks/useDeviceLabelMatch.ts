import * as React from 'react';

import { Fleet, FleetList } from '@flightctl/types';
import { FlightCtlLabel } from '../types/extraTypes';
import { useFetch } from './useFetch';
import { getErrorMessage } from '../utils/error';

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

type MatchLabelsFn = (labels: FlightCtlLabel[], hasErrors: boolean) => void;

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

const useDeviceLabelMatch = (): [MatchLabelsFn, DeviceMatchStatus] => {
  const { get } = useFetch();
  const abortControllerRef = React.useRef<AbortController>();

  const [matchStatus, setMatchStatus] = React.useState<DeviceMatchStatus>({
    status: 'unchecked',
    detail: '',
  });

  const matchLabelsFn = React.useCallback(
    (newLabels: FlightCtlLabel[], hasErrors: boolean) => {
      const matchDeviceLabels = async () => {
        // TODO PoC implementation, we're missing the ability of filtering in the "fleets" endpoint.
        let result: DeviceMatchStatus = {
          status: 'unchecked',
          detail: '',
        };

        try {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          abortControllerRef.current = new AbortController();

          const allFleets = await get<FleetList>('fleets', abortControllerRef.current.signal);

          result = getMatchResult(allFleets.items ?? [], newLabels);
        } catch (e) {
          // aborting fetch trows 'AbortError', we can ignore it
          if (!abortControllerRef.current?.signal.aborted) {
            result = { status: 'checked--error', detail: getErrorMessage(e) };
          }
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
