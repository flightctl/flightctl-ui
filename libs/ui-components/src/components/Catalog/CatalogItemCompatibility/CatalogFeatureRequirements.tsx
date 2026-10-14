import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Label,
  List,
  ListItem,
  Popover,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import type { Device, DeviceList, Fleet } from '@flightctl/types';
import { DeviceFeatureBoolean, type DeviceFeatures } from '@flightctl/types/alpha';

import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { getApiListCount } from '../../../utils/api';
import { deviceMeetsFeatureRequirements } from '../../../utils/capabilities';
import { deviceFeaturesToFilters } from '../../../utils/catalogDeviceFeatures';
import { commonQueries } from '../../../utils/query';
import { type DeviceFeatureFilter, getFeatureRequirementText } from '../../../utils/status/devices';

export const FeatureCompatibilityBadge = ({ compatibility }: { compatibility: DeviceFeatureBoolean | undefined }) => {
  const { t } = useTranslation();
  switch (compatibility) {
    case DeviceFeatureBoolean.DeviceFeatureBooleanTrue:
      return (
        <Label isCompact variant="outline" status="success">
          {t('Compatible')}
        </Label>
      );
    case DeviceFeatureBoolean.DeviceFeatureBooleanFalse:
      return (
        <Label isCompact variant="outline" status="danger">
          {t('Incompatible')}
        </Label>
      );
    default:
      return (
        <Label isCompact variant="outline" status="warning">
          {t('Needs attention')}
        </Label>
      );
  }
};

const FleetFeatureCompatibilityBadge = ({
  compatibleCount,
  totalDevices,
}: {
  compatibleCount: number;
  totalDevices: number;
}) => {
  const { t } = useTranslation();

  let compatibility: DeviceFeatureBoolean | undefined;
  if (compatibleCount >= totalDevices) {
    compatibility = DeviceFeatureBoolean.DeviceFeatureBooleanTrue;
  } else if (compatibleCount === 0) {
    compatibility = DeviceFeatureBoolean.DeviceFeatureBooleanFalse;
  } else {
    compatibility = undefined;
  }
  return (
    <>
      <FeatureCompatibilityBadge compatibility={compatibility} />
      <Popover
        aria-label={t('Device feature compatibility details')}
        bodyContent={t('{{numOfDevices}} of {{total}} devices may not meet the requirements for this catalog item.', {
          numOfDevices: Math.max(totalDevices - compatibleCount, 0),
          total: totalDevices,
          count: totalDevices,
        })}
        withFocusTrap
        triggerAction="click"
      >
        <Button
          icon={<OutlinedQuestionCircleIcon aria-label="View device feature compatibility details" />}
          isInline
          variant="plain"
        />
      </Popover>
    </>
  );
};

const RequirementBadge = ({
  featureFilter,
  targetDevice,
  fleetCompatibleCount,
  totalDevices,
}: {
  featureFilter: DeviceFeatureFilter;
  targetDevice?: Device;
  fleetCompatibleCount?: number;
  totalDevices: number;
}) => {
  if (targetDevice && targetDevice.status) {
    const compatibility = deviceMeetsFeatureRequirements(targetDevice.status, [featureFilter]);
    return <FeatureCompatibilityBadge compatibility={compatibility} />;
  }

  if (fleetCompatibleCount !== undefined && totalDevices > 0) {
    return <FleetFeatureCompatibilityBadge compatibleCount={fleetCompatibleCount} totalDevices={totalDevices} />;
  }
  return null;
};

// Lists all the feature requirements for a catalog item version.
// Additionally, if targetDevice/targetFleet is passed, it shows a badge indicating the compatibility of the item and the target.
// Placements:
// - Catalog item details drawer (below the channel and version dropdowns)
// - Fleet/Device catalog tab -> Deploy or Edit catalog item (banner above the wizard content)
// - Software Catalog -> Deploy wizard -> Select target  (banner above the Fleet/Device table)
const CatalogFeatureRequirements = ({
  deviceFeatures,
  targetDevice,
  targetFleet,
}: {
  deviceFeatures?: DeviceFeatures;
  targetDevice?: Device;
  targetFleet?: Fleet;
}) => {
  const { t } = useTranslation();
  const { get } = useFetch();

  const featureFilters = React.useMemo(() => deviceFeaturesToFilters(deviceFeatures), [deviceFeatures]);
  const hasRequirements = featureFilters && featureFilters.length > 0;

  const fleetName = targetFleet?.metadata.name;
  const totalDevices = targetFleet?.status?.devicesSummary?.total || 0;
  const hasDeviceTarget = Boolean(targetDevice);

  const [fleetCompatibleCounts, setFleetCompatibleCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!fleetName || !featureFilters?.length || totalDevices <= 0 || hasDeviceTarget) {
      setFleetCompatibleCounts({});
      return;
    }

    let cancelled = false;
    const loadCompatibleCounts = async () => {
      try {
        const deviceLists = await Promise.all(
          featureFilters.map((filter) =>
            get<DeviceList>(commonQueries.getFullyCompatibleDeviceCount(fleetName, [filter])),
          ),
        );
        if (cancelled) {
          return;
        }
        const counts: Record<string, number> = {};
        featureFilters.forEach((filter, index) => {
          counts[filter.fieldId] = getApiListCount(deviceLists[index]) || 0;
        });
        setFleetCompatibleCounts(counts);
      } catch {
        if (!cancelled) {
          // Fail open: omit badges when the compatibility check cannot be loaded.
          setFleetCompatibleCounts({});
        }
      }
    };

    void loadCompatibleCounts();
    return () => {
      cancelled = true;
    };
  }, [fleetName, featureFilters, totalDevices, hasDeviceTarget, get]);

  if (!hasRequirements) {
    return (
      <Content component={ContentVariants.small}>{t('No device requirements were detected for this version.')}</Content>
    );
  }

  const showBadges = Boolean(targetDevice || (targetFleet && totalDevices > 0));
  return (
    <List isPlain>
      {featureFilters.map((featureFilter) => (
        <ListItem key={featureFilter.fieldId}>
          <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              {getFeatureRequirementText(
                t,
                featureFilter.fieldId,
                featureFilter.values[0] === DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
              )}
            </FlexItem>
            {showBadges && (
              <FlexItem>
                <RequirementBadge
                  featureFilter={featureFilter}
                  targetDevice={targetDevice}
                  fleetCompatibleCount={fleetCompatibleCounts[featureFilter.fieldId]}
                  totalDevices={totalDevices}
                />
              </FlexItem>
            )}
          </Flex>
        </ListItem>
      ))}
    </List>
  );
};

export default CatalogFeatureRequirements;
