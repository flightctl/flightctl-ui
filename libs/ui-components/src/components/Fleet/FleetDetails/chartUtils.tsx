import percentRound from 'percent-round';

import { StatusMap } from '../../OverviewPage/Cards/Status/utils';
import { StatusItem, getDefaultStatusColor } from '../../../utils/status/common';
import { Data } from '../../charts/DonutChart';
import { FilterSearchParams } from '../../../utils/status/devices';
import { ROUTE } from '../../../hooks/useNavigate';

export const toChartData = <T extends string>(
  fleetId: string,
  map: StatusMap<T>,
  statusItems: StatusItem<T>[],
  statusFilter: string,
) => {
  const percentages = percentRound(Object.values(map));

  return Object.entries(map).map<Data>(([statusId, statusCount], index) => {
    const item = statusItems.find(({ id }) => id === statusId) as StatusItem<T>;

    const query = new URLSearchParams();
    query.append(FilterSearchParams.Fleet, fleetId);
    query.append(statusFilter, item.id);

    return {
      x: `${item.label}`,
      y: percentages[index],
      color: getDefaultStatusColor(item.level),
      link: {
        to: ROUTE.DEVICES,
        query: query.toString(),
      },
      tooltip: `${statusCount as number} ${item.label}`,
    };
  });
};
