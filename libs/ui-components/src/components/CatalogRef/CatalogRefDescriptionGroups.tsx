import * as React from 'react';
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import type { CatalogItemRefSpec } from '@flightctl/types';
import { type CatalogItem, CatalogItemType } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';

type CatalogRefDescriptionGroupsProps = {
  catalogItemRef: CatalogItemRefSpec;
  channel: string;
  imageUri?: string;
  item?: CatalogItem;
};

const ImageUriLabel = ({ itemType, imageUri }: { itemType?: CatalogItemType; imageUri: string }) => {
  const { t } = useTranslation();

  let label: string;
  switch (itemType) {
    case CatalogItemType.CatalogItemTypeOS:
      label = t('Container image');
      break;
    case CatalogItemType.CatalogItemTypeHelm:
      label = t('Chart reference');
      break;
    default:
      label = t('Image reference');
  }

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{label}</DescriptionListTerm>
      <DescriptionListDescription>{imageUri}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};

const CatalogRefDescriptionGroups = ({ catalogItemRef, channel, imageUri, item }: CatalogRefDescriptionGroupsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Catalog item name')}</DescriptionListTerm>
        <DescriptionListDescription>{catalogItemRef.item}</DescriptionListDescription>
      </DescriptionListGroup>
      {imageUri && <ImageUriLabel itemType={item?.spec.type} imageUri={imageUri} />}
      {channel && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Channel')}</DescriptionListTerm>
          <DescriptionListDescription>{channel}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
        <DescriptionListDescription>{catalogItemRef.version}</DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};

export default CatalogRefDescriptionGroups;
