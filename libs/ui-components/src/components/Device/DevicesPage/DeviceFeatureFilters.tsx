import * as React from 'react';
import { Grid, GridItem, SelectList, SelectOption } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { DeviceFeature, DeviceFeatureFilter } from '../../../utils/status/devices';
import { DEVICE_CAPABILITY_FILTER_VALUES } from '../../../utils/status/devices';
import FilterSelect, { FilterSelectGroup } from '../../form/FilterSelect';
import { DEVICE_HARDWARE_FEATURES, DEVICE_OS_MODE_FEATURE } from '../../../utils/status/devices';
import {
  getDeviceFeatureFilterLabel,
  getFeatureFilterValues,
  toggleFeatureFilterValue,
} from '../../../utils/status/devices';

const FeatureFilterOptions = ({
  features,
  setSelectedFeatures,
  selectedFeatures,
}: {
  features: DeviceFeature[];
  setSelectedFeatures: (filters: DeviceFeatureFilter[]) => void;
  selectedFeatures: DeviceFeatureFilter[];
}) => {
  const { t } = useTranslation();

  return features.map((feature) =>
    DEVICE_CAPABILITY_FILTER_VALUES.map((value) => (
      <SelectOption
        key={`${feature.fieldId}-${value}`}
        hasCheckbox
        value={`${feature.fieldId}-${value}`}
        isSelected={getFeatureFilterValues(selectedFeatures, feature.fieldId).includes(value)}
        onClick={() => setSelectedFeatures(toggleFeatureFilterValue(selectedFeatures, feature.fieldId, value))}
      >
        {getDeviceFeatureFilterLabel(t, feature.fieldId, value)}
      </SelectOption>
    )),
  );
};

const DeviceFeatureFilters = ({
  selectedFeatures,
  selectedFeaturesCount,
  setSelectedFeatures,
  isFilterUpdating,
}: {
  selectedFeatures: DeviceFeatureFilter[];
  selectedFeaturesCount: number;
  setSelectedFeatures: (filters: DeviceFeatureFilter[]) => void;
  isFilterUpdating: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <FilterSelect
      selectedFilters={selectedFeaturesCount}
      placeholder={t('Filter by device requirements')}
      isFilterUpdating={isFilterUpdating}
    >
      <SelectList>
        <Grid hasGutter>
          <GridItem span={6}>
            <FilterSelectGroup label={t('OS mode')}>
              <FeatureFilterOptions
                features={[DEVICE_OS_MODE_FEATURE]}
                setSelectedFeatures={setSelectedFeatures}
                selectedFeatures={selectedFeatures}
              />
            </FilterSelectGroup>
          </GridItem>
          <GridItem span={6}>
            <FilterSelectGroup label={t('Hardware')}>
              <FeatureFilterOptions
                features={DEVICE_HARDWARE_FEATURES}
                setSelectedFeatures={setSelectedFeatures}
                selectedFeatures={selectedFeatures}
              />
            </FilterSelectGroup>
          </GridItem>
        </Grid>
      </SelectList>
    </FilterSelect>
  );
};

export default DeviceFeatureFilters;
