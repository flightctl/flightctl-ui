import * as React from 'react';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  Spinner,
} from '@patternfly/react-core';

import type { CatalogItemRefSpec, ImageOrCatalogItemRefSpec } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatCatalogItemRef } from '../../../utils/catalog';
import { useSystemImage } from './useSystemImage';

export const SystemImageCatalogLabel = () => {
  const { t } = useTranslation();
  return (
    <Label variant="outline" isCompact color="blue" className="pf-v6-u-ml-xs">
      {t('Catalog')}
    </Label>
  );
};

export const SystemImageDisplay = ({
  catalogItemRef,
  imageUri,
}: {
  catalogItemRef: CatalogItemRefSpec | undefined;
  imageUri?: string;
}) => {
  if (catalogItemRef) {
    return (
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'nowrap' }}
      >
        <FlexItem>
          <SystemImageCatalogLabel />
        </FlexItem>
        <FlexItem>{imageUri || formatCatalogItemRef(catalogItemRef)}</FlexItem>
      </Flex>
    );
  }
  return imageUri || '-';
};

const SystemImageDescriptionGroup = ({
  osSpec,
  isFleet,
}: {
  osSpec: ImageOrCatalogItemRefSpec | undefined;
  isFleet: boolean;
}) => {
  const { t } = useTranslation();
  const imageResult = useSystemImage(osSpec);
  const isCatalogItemRef = osSpec?.catalogItemRef !== undefined;

  let osContent: React.ReactNode;
  if (imageResult.isLoading) {
    osContent = <Spinner size="sm" />;
  } else if (imageResult.imageUri || isCatalogItemRef) {
    osContent = imageResult.imageUri || formatCatalogItemRef(osSpec?.catalogItemRef as CatalogItemRefSpec);
  } else {
    osContent = isFleet ? t('The fleet will not manage system image') : t('The device will not manage system image');
  }

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        {t('System image')}
        {isCatalogItemRef && <SystemImageCatalogLabel />}
      </DescriptionListTerm>
      <DescriptionListDescription>{osContent}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default SystemImageDescriptionGroup;
