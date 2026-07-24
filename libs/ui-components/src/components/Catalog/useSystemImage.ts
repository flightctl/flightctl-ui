import type { ImageOrCatalogItemRefSpec } from '@flightctl/types';

import { formatCatalogItemRef } from '../../utils/catalog';
import { useResolvedCatalogRef } from './useResolvedCatalogRef';

type UseSystemImageResult = {
  isLoading: boolean;
  label?: string | undefined;
  imageUri?: string | undefined;
};

export const useSystemImage = (osSpec?: ImageOrCatalogItemRefSpec): UseSystemImageResult => {
  const catalogRef = osSpec?.catalogItemRef;
  const catalogItem = useResolvedCatalogRef(catalogRef);
  if (catalogItem?.isLoading) {
    return { isLoading: true };
  }

  const label = catalogRef ? formatCatalogItemRef(catalogRef) : osSpec?.image;
  return {
    isLoading: false,
    label: label || catalogItem?.imageUri,
    imageUri: catalogItem?.imageUri,
  };
};
