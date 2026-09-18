import * as React from 'react';
import { Alert, DescriptionList, Stack, StackItem } from '@patternfly/react-core';
import type { CatalogItemRefSpec } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import CatalogRefDescriptionGroups from './CatalogRefDescriptionGroups';
import type { UseResolvedCatalogRefResult } from '../Catalog/useResolvedCatalogRef';

type CatalogRefCardDetailsProps = {
  catalogItemRef: CatalogItemRefSpec;
  resolvedRef?: UseResolvedCatalogRefResult;
};

const CatalogRefCardDetails = ({ catalogItemRef, resolvedRef }: CatalogRefCardDetailsProps) => {
  const { t } = useTranslation();

  const channel = catalogItemRef.channel || resolvedRef?.channel || '';
  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList isCompact columnModifier={{ default: '2Col' }} aria-label={t('Catalog item details')}>
          <CatalogRefDescriptionGroups
            catalogItemRef={catalogItemRef}
            channel={channel}
            imageUri={resolvedRef?.imageUri}
            item={resolvedRef?.item}
          />
        </DescriptionList>
      </StackItem>

      {!resolvedRef?.item && (
        <StackItem>
          <Alert isInline variant="warning" title={t('Catalog item could not be resolved')}>
            {t(
              'The referenced catalog item could not be loaded. Verify the item still exists in the Software Catalog.',
            )}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default CatalogRefCardDetails;
