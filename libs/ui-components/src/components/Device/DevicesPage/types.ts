import { type FilterSearchParams } from '../../../utils/status/devices';
import {
  type ApplicationsSummaryStatusType,
  type DeviceSummaryStatusType,
  type DeviceUpdatedStatusType,
} from '@flightctl/types';

export type FilterStatusMap = {
  [FilterSearchParams.AppStatus]: ApplicationsSummaryStatusType[];
  [FilterSearchParams.DeviceStatus]: DeviceSummaryStatusType[];
  [FilterSearchParams.UpdatedStatus]: DeviceUpdatedStatusType[];
};

export type UpdateStatus = (statusType?: keyof FilterStatusMap, status?: string) => void;
