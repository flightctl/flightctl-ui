import * as React from 'react';
import { Alert, Icon } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import type { Device, DeviceList } from '@flightctl/types';
import { DeviceFeatureBoolean, type DeviceFeatures } from '@flightctl/types/alpha';

import { useFetch } from '../../hooks/useFetch';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { useTranslation } from '../../hooks/useTranslation';
import { getApiListCount } from '../../utils/api';
import { deviceMeetsFeatureRequirements } from '../../utils/capabilities';
import { deviceFeaturesToFilters } from '../../utils/catalogDeviceFeatures';
import { commonQueries } from '../../utils/query';
import IncompatibleFleetDevicesActionLinks from './IncompatibleFleetDevicesActionLinks';

// The compatibility of an individual device with a catalog item can be:
// - Unknown: the device has not reported on all the required features
// - Compatible: the device reported all the required features, and it meets all the feature requirements
// - Incompatible: the device reported all the required features, and it does not meet at least one of the feature requirements
export const DeviceCatalogItemCompatibilityAlert = ({
  device,
  featureRequirements,
}: {
  device: Device;
  featureRequirements?: DeviceFeatures;
}) => {
  const { t } = useTranslation();
  const featureFilters = deviceFeaturesToFilters(featureRequirements);
  if (!featureFilters?.length || !device.status) {
    return null;
  }

  const compatibility = deviceMeetsFeatureRequirements(device.status, featureFilters);
  if (compatibility === DeviceFeatureBoolean.DeviceFeatureBooleanTrue) {
    return null;
  }

  const reviewDeviceLink = (
    <Link
      to={{ route: ROUTE.DEVICE_DETAILS, postfix: device.metadata.name || '' }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {t('Review device')}{' '}
      <Icon>
        <ExternalLinkAltIcon />
      </Icon>
    </Link>
  );

  if (compatibility === DeviceFeatureBoolean.DeviceFeatureBooleanFalse) {
    return (
      <Alert
        isInline
        variant="danger"
        title={t('Review compatibility before deploying')}
        actionLinks={reviewDeviceLink}
      >
        {t(
          'This device may not meet the requirements for this catalog item. You can continue, but the device may not be able to run the catalog item.',
        )}
      </Alert>
    );
  }

  return (
    <Alert isInline variant="info" title={t('Compatibility could not be determined')} actionLinks={reviewDeviceLink}>
      {t(
        'This device has not reported all required features. You can continue, but compatibility with this catalog item is unknown.',
      )}
    </Alert>
  );
};

// The compatibility of the fleet's devices with a catalog item can be:
// - Compatible: for devices that have reported all the required features, and all the requirements are met
// - Unknown/Incompatible: for devices where the above is not true. The device may have a mix of unreported or incompatible features
//   It's not possible to obtain a more precise count, as filters are always ANDed together.

export const FleetCatalogItemCompatibilityAlert = ({
  fleetName,
  totalDevices,
  featureRequirements,
  context = 'installWizard',
}: {
  fleetName: string;
  totalDevices: number;
  featureRequirements?: DeviceFeatures;
  context?: 'installWizard' | 'fleetDetails';
}) => {
  const { t } = useTranslation();
  const { get } = useFetch();

  const featureFilters = React.useMemo(() => deviceFeaturesToFilters(featureRequirements), [featureRequirements]);

  const [fullyCompatibleCount, setFullyCompatibleCount] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (!fleetName || !featureFilters?.length || totalDevices <= 0) {
      setFullyCompatibleCount(undefined);
      return;
    }

    let cancelled = false;
    const loadCompatibleCount = async () => {
      try {
        const deviceList = await get<DeviceList>(
          commonQueries.getFullyCompatibleDeviceCount(fleetName, featureFilters),
        );
        if (!cancelled) {
          setFullyCompatibleCount(getApiListCount(deviceList) || 0);
        }
      } catch {
        if (!cancelled) {
          // Fail open: do not block deploy when the compatibility check cannot be loaded.
          setFullyCompatibleCount(undefined);
        }
      }
    };

    void loadCompatibleCount();
    return () => {
      cancelled = true;
    };
  }, [fleetName, featureFilters, totalDevices, get]);

  // Keep showing the last result while a refresh is in flight to avoid flicker.
  if (!featureFilters?.length || totalDevices <= 0 || fullyCompatibleCount === undefined) {
    return null;
  }

  const needsAttentionCount = Math.max(0, totalDevices - fullyCompatibleCount);
  if (needsAttentionCount === 0) {
    return null;
  }

  const title =
    context === 'fleetDetails' ? t('Catalog deployments need attention') : t('Review compatibility before deploying');
  const body =
    context === 'fleetDetails'
      ? t(
          '{{numOfDevices}} of {{totalDevices}} devices may not meet the requirements for catalog items deployed to this fleet. Some devices may not be able to run those catalog items.',
          { numOfDevices: needsAttentionCount, totalDevices, count: totalDevices },
        )
      : t(
          '{{numOfDevices}} of {{totalDevices}} devices may not meet the requirements for this catalog item. You can continue, but some devices may not be able to run the catalog item.',
          { numOfDevices: needsAttentionCount, totalDevices, count: totalDevices },
        );

  return (
    <Alert isInline variant="warning" title={title}>
      {body}
      <IncompatibleFleetDevicesActionLinks fleetName={fleetName} featureRequirements={featureRequirements} />
    </Alert>
  );
};
