import type { ImageOrCatalogItemRefSpec } from '@flightctl/types';

import { useResolvedCatalogRef } from '../../Catalog/useResolvedCatalogRef';

type UseSystemImageResult = {
  isLoading: boolean;
  isCatalogRef: boolean;
  imageUri?: string | undefined;
};

export const useSystemImage = (osSpec?: ImageOrCatalogItemRefSpec): UseSystemImageResult => {
  const catalogRef = osSpec?.catalogItemRef;
  const isCatalogRef = Boolean(catalogRef);
  const catalogItem = useResolvedCatalogRef(catalogRef);
  if (catalogItem?.isLoading) {
    return { isLoading: true, isCatalogRef };
  }

  return {
    isLoading: false,
    imageUri: catalogItem?.imageUri || osSpec?.image,
    isCatalogRef,
  };
};
