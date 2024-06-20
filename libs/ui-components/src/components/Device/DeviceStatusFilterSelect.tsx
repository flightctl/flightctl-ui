import * as React from 'react';
import { SelectOption } from '@patternfly/react-core';
import { StatusFilterItem } from '../../utils/status/devices';

import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import StatusLabel, { StatusLabelColor } from '../common/StatusLabel';

const getDefaultIcon = (iconType: StatusLabelColor) => {
  let iconClass: React.ComponentClass<SVGIconProps>;
  switch (iconType) {
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
      iconClass = QuestionCircleIcon;
      break;
  }
  return iconClass;
};

type DeviceStatusFilterSelectProps = {
  type: StatusFilterItem['type'];
  items: Array<StatusFilterItem>;
  selectedFilters: Array<string>;
};

const DeviceStatusFilterSelect = ({ type, items, selectedFilters }: DeviceStatusFilterSelectProps) => {
  return items
    .filter((item) => item.type === type)
    .map((statusItem) => {
      const itemKey = `${type}#${statusItem.id}`;
      const IconComponent = statusItem.customIcon || getDefaultIcon(statusItem.iconType);
      return (
        <SelectOption key={itemKey} hasCheckbox value={itemKey} isSelected={selectedFilters.includes(itemKey)}>
          <StatusLabel status={statusItem.iconType} icon={<IconComponent />} label={statusItem.label} />
        </SelectOption>
      );
    });
};

export default DeviceStatusFilterSelect;
