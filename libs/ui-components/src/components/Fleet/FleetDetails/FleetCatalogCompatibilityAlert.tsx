import * as React from 'react';
import { Alert } from '@patternfly/react-core';

import type { Fleet } from '@flightctl/types';
import type { DeviceFeatures } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { mergeDeviceFeatures } from '../../../utils/catalogDeviceFeatures';
import { useCatalogItemsContext } from '../../Catalog/CatalogItemsContext';
import { FleetCatalogItemCompatibilityAlert } from '../../Catalog/CatalogItemCompatibilityAlert';
import { getVersionFeatureRequirements } from '../../CatalogComposition/catalogCompositionUtils';

/**
 * Warns on fleet details when some devices may not meet the combined device-feature
 * requirements of catalog items currently deployed on the fleet template.
 * Uses one compatibility count query for this fleet (not per-fleet list queries).
 */
const FleetCatalogCompatibilityAlert = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const { getItem, isLoading, catalogItemIds } = useCatalogItemsContext();

  const { allFeatureRequirements, hasContradingRequirements } = React.useMemo((): {
    allFeatureRequirements: DeviceFeatures | undefined;
    hasContradingRequirements: boolean;
  } => {
    if (isLoading || catalogItemIds.length === 0) {
      return { allFeatureRequirements: undefined, hasContradingRequirements: false };
    }
    try {
      return {
        allFeatureRequirements: mergeDeviceFeatures(
          ...catalogItemIds.map(({ ref }) => {
            const item = getItem(ref.catalog, ref.item);
            if (!item) {
              return undefined;
            }
            return getVersionFeatureRequirements(item, ref.version);
          }),
        ),
        hasContradingRequirements: false,
      };
    } catch {
      return { allFeatureRequirements: undefined, hasContradingRequirements: true };
    }
  }, [catalogItemIds, getItem, isLoading]);

  const fleetName = fleet.metadata.name as string;
  const totalDevices = fleet.status?.devicesSummary?.total || 0;

  if (hasContradingRequirements) {
    return (
      <Alert isInline variant="danger" title={t('Catalog requirements conflict')}>
        {t(
          'The catalog items deployed to this fleet have contradicting device requirements. Some catalog items may not run on the same devices. Review the catalog deployments to resolve the conflict.',
        )}
      </Alert>
    );
  }

  return (
    <FleetCatalogItemCompatibilityAlert
      fleetName={fleetName}
      totalDevices={totalDevices}
      featureRequirements={allFeatureRequirements}
      context="fleetDetails"
    />
  );
};

export default FleetCatalogCompatibilityAlert;
