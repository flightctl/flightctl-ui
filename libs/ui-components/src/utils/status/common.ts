import * as React from 'react';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import warningColor from '@patternfly/react-tokens/dist/js/t_global_color_status_warning_200';
import dangerColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_danger_default';
import successColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_success_default';
import disabledColor from '@patternfly/react-tokens/dist/js/t_global_color_disabled_200';
import activeColor from '@patternfly/react-tokens/dist/js/t_global_color_status_info_200';
import defaultColor from '@patternfly/react-tokens/dist/js/t_chart_color_black_200';

export type StatusLevel = 'custom' | 'info' | 'success' | 'warning' | 'danger' | 'unknown';

export interface StatusItem<T extends string> {
  id: T;
  label: string;
  level: StatusLevel;
  customIcon?: React.ComponentClass<SVGIconProps>;
  customColor?: string;
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
    case 'unknown':
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
      color = defaultColor.value;
      break;
    default:
      color = disabledColor.value;
      break;
  }
  return color;
};
