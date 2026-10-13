import * as React from 'react';
import { Content, ContentVariants, List, ListItem, Stack, StackItem } from '@patternfly/react-core';

import { DeviceFeatureBoolean, type DeviceFeatures } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import { deviceFeaturesToFilters } from '../../utils/catalogDeviceFeatures';
import { getFeatureRequirementText } from '../../utils/status/devices';

const CatalogFeatureRequirements = ({ deviceFeatures }: { deviceFeatures?: DeviceFeatures }) => {
  const { t } = useTranslation();

  const featureFilters = React.useMemo(() => deviceFeaturesToFilters(deviceFeatures), [deviceFeatures]);
  const hasRequirements = featureFilters && featureFilters.length > 0;

  return (
    <Stack hasGutter>
      {hasRequirements ? (
        <List isPlain>
          {featureFilters.map((featureFilter) => (
            <ListItem key={featureFilter.fieldId}>
              {getFeatureRequirementText(
                t,
                featureFilter.fieldId,
                featureFilter.values[0] === DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <StackItem>
          <Content component={ContentVariants.small}>
            {t('No device requirements were detected for this version.')}
          </Content>
        </StackItem>
      )}
    </Stack>
  );
};

export default CatalogFeatureRequirements;
