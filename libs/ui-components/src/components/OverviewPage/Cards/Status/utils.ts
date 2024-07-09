import percentRound from 'percent-round';
import { ROUTE } from '../../../../hooks/useNavigate';
import { StatusItem, getDefaultStatusColor } from '../../../../utils/status/common';
import { Data } from '../../../charts/DonutChart';
import { FilterSearchParams } from '../../../../utils/status/devices';

export type StatusMap<T extends string> = Record<T, number>;

export const toChartData = <T extends string>(
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

export const labelToString = (label: { key: string; value: string }) =>
  `${label.key}${label.value ? `=${label.value}` : ''}`;
