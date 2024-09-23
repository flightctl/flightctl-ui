import { DeviceSummaryStatus, FilterSearchParams } from '../../../utils/status/devices';
import { StatusItem } from '../../../utils/status/common';
import { ApplicationsSummaryStatusType, DeviceSummaryStatusType, DeviceUpdatedStatusType } from '@flightctl/types';

type FilterOptionsProps<T extends DeviceSummaryStatus> = {
  filter: string;
  items: Array<StatusItem<T>>;
  selectedFilters: Array<T>;
  onClick: (value: string) => void;
};

export type FilterOptionsFC = <T extends DeviceSummaryStatus>(
  props: FilterOptionsProps<T>,
) => JSX.Element | JSX.Element[];

export type FilterStatusMap = {
  [FilterSearchParams.AppStatus]: ApplicationsSummaryStatusType[];
  [FilterSearchParams.DeviceStatus]: DeviceSummaryStatusType[];
  [FilterSearchParams.UpdatedStatus]: DeviceUpdatedStatusType[];
};

export type UpdateStatus = (statusType?: keyof FilterStatusMap, status?: string) => void;
