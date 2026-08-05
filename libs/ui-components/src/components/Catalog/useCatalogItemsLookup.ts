import * as React from 'react';
import type { CatalogItem } from '@flightctl/types/alpha';

import { useFetch } from '../../hooks/useFetch';
import { type CatalogItemId, catalogItemCacheKey } from '../../utils/catalog';

const catalogItemEndpoint = (id: CatalogItemId): string =>
  `catalogs/${encodeURIComponent(id.catalog)}/items/${encodeURIComponent(id.item)}`;

/** Matches K8s DNS subdomain resource names used for Catalog / CatalogItem metadata.name. */
const CATALOG_PATH_SEGMENT_MAX_LENGTH = 253;
const CATALOG_PATH_SEGMENT_REGEXP = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const isValidCatalogPathSegment = (segment: string): boolean =>
  segment.length > 0 && segment.length <= CATALOG_PATH_SEGMENT_MAX_LENGTH && CATALOG_PATH_SEGMENT_REGEXP.test(segment);

const isValidCatalogItemId = (id: CatalogItemId): boolean =>
  isValidCatalogPathSegment(id.catalog) && isValidCatalogPathSegment(id.item);

export type CatalogItemsLookupResult = {
  getItem: (catalog: string, item: string) => CatalogItem | undefined;
  isLoading: boolean;
  error?: unknown;
};

/**
 * Dedupes, sorts, and validates ids into a stable effect dependency key.
 * Returns null if any ids are invalid.
 */
const getNeededCatalogItemIdsKey = (ids: CatalogItemId[]): string | null => {
  const byKey = new Map<string, CatalogItemId>();
  let hasError = false;
  ids.forEach((id) => {
    const isValid = isValidCatalogItemId(id);
    if (isValid) {
      byKey.set(catalogItemCacheKey(id), id);
    } else {
      hasError = true;
      return;
    }
  });
  if (hasError) {
    return null;
  }
  return JSON.stringify(
    [...byKey.values()].sort((a, b) => a.catalog.localeCompare(b.catalog) || a.item.localeCompare(b.item)),
  );
};

export const useCatalogItemFromParams = (params: { catalogId: string; itemId: string }) => {
  const { catalogId, itemId } = params;
  const { getItem, isLoading, error } = useCatalogItemsLookup([{ catalog: catalogId, item: itemId }]);
  const item = getItem(catalogId, itemId);
  return { item, isLoading, error };
};

/**
 * Fetches and caches CatalogItems by catalog/item id.
 * Dedupes, fetches only missing ids, and soft-fails individual requests (exposes aggregate error).
 */
export const useCatalogItemsLookup = (ids: CatalogItemId[]): CatalogItemsLookupResult => {
  const { get: fetchGet } = useFetch();
  const [catalogItemsByKey, setCatalogItemsByKey] = React.useState<Map<string, CatalogItem>>(() => new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>();
  const catalogItemsCacheRef = React.useRef<Map<string, CatalogItem>>(new Map());

  const neededCatalogItemIdsKey = getNeededCatalogItemIdsKey(ids);

  React.useEffect(() => {
    let cancelled = false;

    const cache = catalogItemsCacheRef.current;

    const publishCache = (nextError?: unknown) => {
      setCatalogItemsByKey(new Map(cache));
      setError(nextError);
      setIsLoading(false);
    };

    if (neededCatalogItemIdsKey === null) {
      publishCache(new Error('Catalog item ids are invalid'));
      return;
    }

    const neededIds = JSON.parse(neededCatalogItemIdsKey) as CatalogItemId[];
    const neededKeys = new Set(neededIds.map(catalogItemCacheKey));

    for (const key of [...cache.keys()]) {
      if (!neededKeys.has(key)) {
        cache.delete(key);
      }
    }

    const missingIds = neededIds.filter((id) => !cache.has(catalogItemCacheKey(id)));

    if (neededIds.length === 0) {
      publishCache(undefined);
      return;
    }

    if (missingIds.length === 0) {
      publishCache(undefined);
      return;
    }

    setIsLoading(true);

    (async () => {
      const results = await Promise.allSettled(
        missingIds.map((id) =>
          fetchGet<CatalogItem>(catalogItemEndpoint(id)).then((value) => ({
            key: catalogItemCacheKey(id),
            value,
          })),
        ),
      );
      if (cancelled) {
        return;
      }

      let firstError: unknown;
      results.forEach((r, idx) => {
        if (r.status === 'rejected') {
          // eslint-disable-next-line no-console
          console.warn(`Failed to fetch catalog item ${missingIds[idx].catalog}/${missingIds[idx].item}`);
          if (firstError === undefined) {
            firstError = r.reason;
          }
        } else {
          cache.set(r.value.key, r.value.value);
        }
      });
      publishCache(firstError);
    })();

    return () => {
      cancelled = true;
    };
  }, [neededCatalogItemIdsKey, fetchGet]);

  const getItem = React.useCallback(
    (catalog: string, item: string) => catalogItemsByKey.get(catalogItemCacheKey({ catalog, item })),
    [catalogItemsByKey],
  );

  return React.useMemo(() => ({ getItem, isLoading, error }), [getItem, isLoading, error]);
};
