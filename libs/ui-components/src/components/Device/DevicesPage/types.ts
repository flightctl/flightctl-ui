import { FilterSearchParams } from '../../../utils/status/devices';
import { ApplicationsSummaryStatusType, DeviceSummaryStatusType, DeviceUpdatedStatusType } from '@flightctl/types';

export type FilterStatusMap = {
  [FilterSearchParams.AppStatus]: ApplicationsSummaryStatusType[];
  [FilterSearchParams.DeviceStatus]: DeviceSummaryStatusType[];
  [FilterSearchParams.UpdatedStatus]: DeviceUpdatedStatusType[];
};

export type UpdateStatus = (statusType?: keyof FilterStatusMap, status?: string) => void;
