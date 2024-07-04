import * as React from 'react';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens/dist/js/global_success_color_100';
import { global_disabled_color_100 as unknownColor } from '@patternfly/react-tokens/dist/js/global_disabled_color_100';
import { global_active_color_100 as activeColor } from '@patternfly/react-tokens/dist/js/global_active_color_100';
import { global_palette_black_1000 as blackColor } from '@patternfly/react-tokens/dist/js/global_palette_black_1000';

import {
  ApplicationStatusType as AppStatus,
  ApplicationsSummaryStatusType as AppSummaryStatus,
  DeviceSummaryStatusType as DeviceSummaryStatus,
  DeviceIntegrityStatusSummaryType as IntegritySummaryStatus,
  DeviceUpdatedStatusType as UpdatedStatus,
} from '@flightctl/types';

export type StatusLevel = 'custom' | 'info' | 'success' | 'warning' | 'danger' | 'unknown';

export enum EnrollmentRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Denied = 'Denied',
  Unknown = 'Unknown',
}

export type StatusItemType =
  | DeviceSummaryStatus
  | AppSummaryStatus
  | AppStatus
  | UpdatedStatus
  | EnrollmentRequestStatus
  | IntegritySummaryStatus;

export enum FilterSearchParams {
  Fleet = 'fleetId',
  DeviceStatus = 'devSt',
  AppStatus = 'appSt',
  UpdatedStatus = 'updSt',
  Noop = 'noop', // Not used in filters
}

export interface StatusItem<T extends StatusItemType> {
  type: FilterSearchParams;
  id: T;
  label: string;
  level: StatusLevel;
  customIcon?: React.ComponentClass<SVGIconProps>;
}

export const getDefaultStatusIcon = (level: StatusLevel) => {
  let iconClass: React.ComponentClass<SVGIconProps>;
  switch (level) {
    case 'info':
      iconClass = InProgressIcon;
      break;
    case 'danger':
      iconClass = ExclamationCircleIcon;
      break;
    case 'warning':
      iconClass = ExclamationTriangleIcon;
      break;
    case 'success':
      iconClass = CheckCircleIcon;
      break;
    default:
      iconClass = OutlinedQuestionCircleIcon;
      break;
  }
  return iconClass;
};

export const getDefaultStatusColor = (level: StatusLevel) => {
  let color: string;
  switch (level) {
    case 'info':
      color = activeColor.value;
      break;
    case 'danger':
      color = dangerColor.value;
      break;
    case 'warning':
      color = warningColor.value;
      break;
    case 'success':
      color = successColor.value;
      break;
    case 'custom':
      color = blackColor.value;
      break;
    default:
      color = unknownColor.value;
      break;
  }
  return color;
};
