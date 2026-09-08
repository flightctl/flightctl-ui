import * as React from 'react';
import type { DeviceSpec } from '@flightctl/types';

import {
  type CatalogItemId,
  type SpecCatalogItemId,
  catalogItemCacheKey,
  extractSpecCatalogItemIds,
  toCatalogItemId,
} from '../../utils/catalog';
import { type CatalogItemsLookupResult, useCatalogItemsLookup } from './useCatalogItemsLookup';

export type CatalogItemsContextValue = CatalogItemsLookupResult & {
  /** Typed catalog refs from the spec (`data` = volume image refs). */
  catalogItemIds: SpecCatalogItemId[];
};

const CatalogItemsContext = React.createContext<CatalogItemsContextValue | undefined>(undefined);

type CatalogItemsProviderProps = React.PropsWithChildren<{
  spec: DeviceSpec | undefined;
}>;

const toFetchIds = (catalogItemIds: SpecCatalogItemId[]): CatalogItemId[] => {
  const byKey = new Map<string, CatalogItemId>();
  catalogItemIds.forEach((entry) => {
    const id = toCatalogItemId(entry.ref);
    byKey.set(catalogItemCacheKey(id), id);
  });
  return [...byKey.values()];
};

/** Page-scoped shared catalog-item lookup. Children reuse one cache via context. */
export const CatalogItemsProvider = ({ spec, children }: CatalogItemsProviderProps) => {
  const catalogItemIds = React.useMemo(() => extractSpecCatalogItemIds(spec), [spec]);
  const ids = React.useMemo(() => toFetchIds(catalogItemIds), [catalogItemIds]);
  const lookup = useCatalogItemsLookup(ids);

  const value = React.useMemo(
    (): CatalogItemsContextValue => ({
      ...lookup,
      catalogItemIds,
    }),
    [lookup, catalogItemIds],
  );

  return <CatalogItemsContext.Provider value={value}>{children}</CatalogItemsContext.Provider>;
};

export const useCatalogItemsContext = (): CatalogItemsContextValue => {
  const context = React.useContext(CatalogItemsContext);
  if (context === undefined) {
    throw new Error('useCatalogItemsContext must be used within a CatalogItemsProvider');
  }
  return context;
};

/** Optional context for convenience hooks that fall back to a local lookup. */
export const useOptionalCatalogItemsContext = (): CatalogItemsContextValue | undefined =>
  React.useContext(CatalogItemsContext);
