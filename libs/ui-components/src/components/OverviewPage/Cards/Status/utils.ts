import { FlightCtlLabel } from '../../../../types/extraTypes';
import { labelToString } from '../../../../utils/labels';
import { FilterSearchParams } from '../../../../utils/status/devices';
import { StatusItem } from '../../../../utils/status/common';
import { StatusMap, toChartData } from '../../../charts/utils';

export const toOverviewChartData = <T extends string>(
  map: StatusMap,
  statusItems: StatusItem<T>[],
  labels: FlightCtlLabel[],
  fleetNames: string[],
  filterName: FilterSearchParams,
) => {
  const baseQuery = new URLSearchParams();
  labels.forEach((l) => baseQuery.append(FilterSearchParams.Label, labelToString(l)));
  fleetNames.forEach((f) => baseQuery.append(FilterSearchParams.Fleet, f));

  return toChartData<T>(map, statusItems, baseQuery, filterName);
};
