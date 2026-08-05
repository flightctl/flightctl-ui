import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { CatalogItem, CatalogItemDeploymentList, CatalogItemList } from '@flightctl/types/alpha';
import { CatalogItemCategory, CatalogItemType } from '@flightctl/types/alpha';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';
import { PAGE_SIZE } from '../../constants';

export const appTypeIds = [
  CatalogItemType.CatalogItemTypeContainer,
  CatalogItemType.CatalogItemTypeHelm,
  CatalogItemType.CatalogItemTypeQuadlet,
  CatalogItemType.CatalogItemTypeCompose,
  CatalogItemType.CatalogItemTypeData,
];

const systemTypeIds = [CatalogItemType.CatalogItemTypeOS];

const buildCatalogItemsFieldSelector = (
  itemType: CatalogItemType[] | undefined,
  catalogs: string[],
  nameFilter?: string,
  excludeItemType?: CatalogItemType,
): string | undefined => {
  const parts: string[] = [];

  let selectedTypes: CatalogItemType[] = [];

  const allTypesSelected = [...systemTypeIds, ...appTypeIds].every((id) => itemType?.includes(id));

  if (!allTypesSelected) {
    selectedTypes = itemType ? [...itemType] : [];

    const categories: CatalogItemCategory[] = [];
    if (appTypeIds.every((id) => selectedTypes.includes(id))) {
      categories.push(CatalogItemCategory.CatalogItemCategoryApplication);
      selectedTypes = selectedTypes.filter((t) => !appTypeIds.includes(t));
    }

    if (categories.length) {
      parts.push(`spec.category in (${categories.join(',')})`);
    }
  }

  const isInvalidSelection = selectedTypes.length === 1 && selectedTypes[0] === excludeItemType;
  if (isInvalidSelection) {
    // When there's a single type to filter for, and at the same time it's been excluded,
    // the query should return no catalog items. (Forced this by querying for a required field not being present)
    parts.push('!spec.type');
  } else if (selectedTypes.length > 0) {
    const typesToQuery = excludeItemType ? selectedTypes.filter((t) => t !== excludeItemType) : selectedTypes;
    parts.push(`spec.type in (${typesToQuery.join(',')})`);
  } else if (excludeItemType) {
    parts.push(`spec.type != ${excludeItemType}`);
  }

  if (nameFilter) {
    parts.push(`metadata.name contains ${nameFilter}`);
  }
  if (catalogs.length) {
    parts.push(`metadata.catalog in (${catalogs.join(',')})`);
  }
  return parts.length > 0 ? parts.join(',') : undefined;
};

export type UseAllCatalogItemsFilter = {
  catalogFilter: {
    itemType?: CatalogItemType[];
    nameFilter?: string | undefined;
    catalogs?: string[];
  };
} & { excludeItemType?: CatalogItemType };

export const useCatalogItems = ({
  catalogFilter,
  excludeItemType,
}: UseAllCatalogItemsFilter): [
  CatalogItem[],
  boolean,
  unknown,
  PaginationDetails<CatalogItemList>,
  boolean,
  VoidFunction,
] => {
  const pagination = useTablePagination<CatalogItemList>();
  const { itemType, nameFilter, catalogs } = catalogFilter;

  const fieldSelector = React.useMemo(
    () =>
      itemType || nameFilter || catalogs || excludeItemType
        ? buildCatalogItemsFieldSelector(itemType, catalogs || [], nameFilter, excludeItemType)
        : undefined,
    [itemType, nameFilter, catalogs, excludeItemType],
  );

  const endpoint = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', `${PAGE_SIZE}`);
    if (pagination.nextContinue) {
      params.set('continue', pagination.nextContinue);
    }
    if (fieldSelector) {
      params.set('fieldSelector', fieldSelector);
    }
    const query = params.toString();
    return query ? `catalogitems?${query}` : 'catalogitems';
  }, [fieldSelector, pagination.nextContinue]);

  const [endpointDebounced] = useDebounce(endpoint, 1000);
  const isDebouncing = endpoint !== endpointDebounced;

  React.useEffect(() => {
    pagination.setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameFilter, itemType, catalogs, excludeItemType]);

  const [catalogItemsList, loading, error, refetch, isFetchUpdating] = useFetchPeriodically<CatalogItemList>(
    { endpoint: endpointDebounced },
    pagination.onPageFetched,
  );

  const isUpdating = loading || isDebouncing || isFetchUpdating;

  return [catalogItemsList?.items || [], loading, error, pagination, isUpdating, refetch];
};

export const useItemIsInUse = (catalogItem: CatalogItem): boolean => {
  const [deployments] = useFetchPeriodically<CatalogItemDeploymentList>({
    endpoint: `catalogs/${catalogItem.metadata.catalog}/items/${catalogItem.metadata.name}/deployments?limit=1`,
  });

  return (deployments?.items?.length ?? 0) > 0;
};
