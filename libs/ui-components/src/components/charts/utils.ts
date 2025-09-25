import percentRound from 'percent-round';

import { StatusItem, getDefaultStatusColor } from '../../utils/status/common';
import { FilterSearchParams } from '../../utils/status/devices';
import { ROUTE, Route } from '../../hooks/useNavigate';

export type StatusMap = Record<string, number>;

export const toChartData = <T extends string>(
  map: StatusMap,
  statusItems: StatusItem<T>[],
  baseQuery: URLSearchParams,
  filterName: FilterSearchParams,
) => {
  const statusMapList = Object.entries<number>(map);
  const percentages = percentRound(statusMapList.map((entry) => entry[1]));

  return statusItems.map((statusItem) => {
    const statusId = statusItem.id;

    // We lookup the index in the original array to get the current status percentage value
    const entryIndex = statusMapList.findIndex((entry) => entry[0] === statusId);

    const query = new URLSearchParams(baseQuery);
    query.append(filterName, statusId);

    return {
      x: `${statusItem.label}`,
      y: entryIndex === -1 ? 0 : percentages[entryIndex],
      color: statusItem.customColor || getDefaultStatusColor(statusItem.level),
      link: {
        to: ROUTE.DEVICES as Route,
        query: query.toString(),
      },
      tooltip: `${map[statusId]} ${statusItem.label}`,
    };
  });
};
