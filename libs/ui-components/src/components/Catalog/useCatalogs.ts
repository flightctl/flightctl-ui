import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { CatalogItem, CatalogItemList } from '@flightctl/types/alpha';
import { CatalogItemCategory, CatalogItemType } from '@flightctl/types/alpha';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';
import { PAGE_SIZE } from '../../constants';

export const useCatalogItem = (
  catalog: string | undefined,
  item: string | undefined,
): [CatalogItem | undefined, boolean, unknown, boolean, VoidFunction] => {
  const [catalogItem, loading, error, refetch, updating] = useFetchPeriodically<CatalogItem>({
    endpoint: catalog && item ? `catalogs/${catalog}/items/${item}` : '',
  });

  return [catalogItem, loading, error, updating, refetch];
};

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
  nameFilter?: string,
): string | undefined => {
  const parts: string[] = [];

  if (![...systemTypeIds, ...appTypeIds].every((id) => itemType?.includes(id))) {
    const categories: CatalogItemCategory[] = [];
    let types = itemType ? [...itemType] : [];

    if (appTypeIds.every((id) => types.includes(id))) {
      categories.push(CatalogItemCategory.CatalogItemCategoryApplication);
      types = types.filter((t) => !appTypeIds.includes(t));
    }

    if (categories.length === 1) {
      parts.push(`spec.category==${categories[0]}`);
    } else if (categories?.length || 0 > 1) {
      parts.push(`spec.category in (${categories.join(',')})`);
    }
    if (types.length === 1) {
      parts.push(`spec.type==${types[0]}`);
    } else if (types.length || 0 > 1) {
      parts.push(`spec.type in (${types?.join(',')})`);
    }
  }

  if (nameFilter?.trim()) {
    parts.push(`metadata.name contains ${nameFilter.trim()}`);
  }
  return parts.length > 0 ? parts.join(',') : undefined;
};

export type UseAllCatalogItemsFilter = {
  itemType?: CatalogItemType[];
  nameFilter?: string | undefined;
};

export const useCatalogItems = ({
  itemType,
  nameFilter,
}: UseAllCatalogItemsFilter): [CatalogItem[], boolean, unknown, PaginationDetails<CatalogItemList>, boolean] => {
  const pagination = useTablePagination<CatalogItemList>();
  const fieldSelector = React.useMemo(
    () => (itemType || nameFilter ? buildCatalogItemsFieldSelector(itemType, nameFilter) : undefined),
    [itemType, nameFilter],
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
  }, [nameFilter, itemType]);

  const [catalogItemsList, loading, error] = useFetchPeriodically<CatalogItemList>(
    { endpoint: endpointDebounced },
    pagination.onPageFetched,
  );

  const isUpdating = loading || isDebouncing;

  return [catalogItemsList?.items || [], loading, error, pagination, isUpdating];
};
