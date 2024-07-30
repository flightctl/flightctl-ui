import percentRound from 'percent-round';
import { ROUTE } from '../../../../hooks/useNavigate';
import { StatusItem, getDefaultStatusColor } from '../../../../utils/status/common';
import { Data } from '../../../charts/DonutChart';
import { FilterSearchParams } from '../../../../utils/status/devices';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import { labelToString } from '../../../../utils/labels';

export type StatusMap<T extends string> = Record<T, number>;

export const toChartData = <T extends string>(
  map: StatusMap<T>,
  statusItems: StatusItem<T>[],
  filterName: FilterSearchParams,
  labels: FlightCtlLabel[],
  fleets: string[],
) => {
  const percentages = percentRound(Object.values(map));
  return Object.keys(map).map<Data>((key, index) => {
    const item = statusItems.find(({ id }) => id === key);

    const query = new URLSearchParams();
    query.append(filterName, key);
    labels.forEach((l) => query.append(FilterSearchParams.Label, labelToString(l)));
    fleets.forEach((f) => query.append(FilterSearchParams.Fleet, f));

    return {
      x: `${item?.label}`,
      y: percentages[index],
      color: getDefaultStatusColor(item!.level),
      link: {
        to: ROUTE.DEVICES,
        query: query.toString(),
      },
      tooltip: `${map[key]} ${item?.label}`,
    };
  });
};
