import * as React from 'react';
import { Button, Flex, FlexItem, Label, type LabelProps, Popover } from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import type { Device } from '@flightctl/types';
import { DeviceFeatureBoolean, type DeviceFeatures } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { deviceMeetsFeatureRequirements } from '../../../utils/capabilities';
import { deviceFeaturesToFilters } from '../../../utils/catalogDeviceFeatures';

const DeviceFeatureCompatibilityContent = ({ compatibility }: { compatibility: DeviceFeatureBoolean | undefined }) => {
  const { t } = useTranslation();

  let status: LabelProps['status'];
  let label: string;
  let msg: string;
  if (compatibility === DeviceFeatureBoolean.DeviceFeatureBooleanTrue) {
    status = 'success';
    label = t('Compatible');
    msg = t('This device meets the requirements for this catalog item.');
  } else if (compatibility === DeviceFeatureBoolean.DeviceFeatureBooleanFalse) {
    status = 'danger';
    label = t('Incompatible');
    msg = t('This device does not meet the requirements for this catalog item');
  } else {
    status = 'warning';
    label = t('Unknown');
    msg = t("This feature's information is not reported for this device.");
  }

  return (
    <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <Label isCompact variant="outline" status={status}>
          {label}
        </Label>
      </FlexItem>
      <FlexItem>
        <Popover
          aria-label={t('Device feature compatibility details')}
          bodyContent={msg}
          withFocusTrap
          triggerAction="click"
        >
          <Button
            icon={<OutlinedQuestionCircleIcon />}
            isInline
            hasNoPadding
            variant="plain"
            aria-label={t('View device feature compatibility details')}
          />
        </Popover>
      </FlexItem>
    </Flex>
  );
};

const DeviceFeatureCompatibility = ({
  device,
  featureRequirements,
}: {
  device: Device;
  featureRequirements?: DeviceFeatures;
}) => {
  const { t } = useTranslation();
  const featureFilters = deviceFeaturesToFilters(featureRequirements);
  if (!featureFilters) {
    return t('No requirements are needed');
  }
  if (!device.status) {
    return t('Requirement compatibility cannot be determined');
  }

  const compatibility = deviceMeetsFeatureRequirements(device.status, featureFilters);
  return <DeviceFeatureCompatibilityContent compatibility={compatibility} />;
};

export default DeviceFeatureCompatibility;
