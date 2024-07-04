import percentRound from 'percent-round';
import { ROUTE } from '../../../../hooks/useNavigate';
import { FilterSearchParams, StatusItem, StatusItemType, getDefaultStatusColor } from '../../../../utils/status/common';
import { Data } from '../../../charts/DonutChart';

export type StatusMap<T extends StatusItemType> = Record<T, number>;

export const toChartData = <T extends StatusItemType>(
  map: StatusMap<T>,
  statusItems: StatusItem<T>[],
  filterName: FilterSearchParams,
) => {
  const percentages = percentRound(Object.values(map));
  return Object.keys(map).map<Data>((key, index) => {
    const item = statusItems.find(({ id }) => id === key);
    return {
      x: `${item?.label}`,
      y: percentages[index],
      color: getDefaultStatusColor(item!.level),
      link: {
        to: ROUTE.DEVICES,
        query: `${filterName}=${key}`,
      },
    };
  });
};
