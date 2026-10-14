import * as React from 'react';
import { Button, Flex, FlexItem, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import type { Device } from '@flightctl/types';
import { DeviceFeatureBoolean, type DeviceFeatures } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { deviceMeetsFeatureRequirements } from '../../../utils/capabilities';
import { deviceFeaturesToFilters } from '../../../utils/catalogDeviceFeatures';
import { FeatureCompatibilityBadge } from './CatalogFeatureRequirements';

const DeviceFeatureCompatibilityContent = ({ compatibility }: { compatibility: DeviceFeatureBoolean | undefined }) => {
  const { t } = useTranslation();

  let msg: string;
  if (compatibility === DeviceFeatureBoolean.DeviceFeatureBooleanTrue) {
    msg = t('This device meets the requirements for this catalog item.');
  } else if (compatibility === DeviceFeatureBoolean.DeviceFeatureBooleanFalse) {
    msg = t('This device does not meet the requirements for this catalog item');
  } else {
    msg = t("This feature's information is not reported for this device.");
  }

  return (
    <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <FeatureCompatibilityBadge compatibility={compatibility} />
      </FlexItem>
      <FlexItem>
        <Popover
          aria-label={t('Device feature compatibility details')}
          bodyContent={msg}
          withFocusTrap
          triggerAction="click"
        >
          <Button
            icon={<OutlinedQuestionCircleIcon aria-label={t('View device feature compatibility details')} />}
            isInline
            hasNoPadding
            variant="plain"
          />
        </Popover>
      </FlexItem>
    </Flex>
  );
};

// Placement: Software Catalog -> Deploy to device -> Shown in an extra column of the devices table
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

  const compatibility = deviceMeetsFeatureRequirements(featureFilters, device.status);
  return <DeviceFeatureCompatibilityContent compatibility={compatibility} />;
};

export default DeviceFeatureCompatibility;
