import { ApplicationsSummaryStatusType, DeviceUpdatedStatusType } from '@flightctl/types';

import { AllDeviceSummaryStatusType } from '../../../types/extraTypes';
import { FilterSearchParams } from '../../../utils/status/devices';

export type FilterStatusMap = {
  [FilterSearchParams.AppStatus]: ApplicationsSummaryStatusType[];
  [FilterSearchParams.DeviceStatus]: AllDeviceSummaryStatusType[];
  [FilterSearchParams.UpdatedStatus]: DeviceUpdatedStatusType[];
};

export type UpdateStatus = (statusType?: keyof FilterStatusMap, status?: string) => void;
