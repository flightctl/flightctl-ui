import * as React from 'react';

import type { CatalogItemId } from '../../utils/catalog';
import { type CatalogItemsLookupResult, useCatalogItemsLookup } from './useCatalogItemsLookup';

const CatalogItemsContext = React.createContext<CatalogItemsLookupResult | undefined>(undefined);

type CatalogItemsProviderProps = React.PropsWithChildren<{
  ids: CatalogItemId[];
}>;

/** Page-scoped shared catalog-item lookup. Children reuse one cache via context. */
export const CatalogItemsProvider = ({ ids, children }: CatalogItemsProviderProps) => {
  const lookup = useCatalogItemsLookup(ids);
  return <CatalogItemsContext.Provider value={lookup}>{children}</CatalogItemsContext.Provider>;
};

export const useCatalogItemsContext = (): CatalogItemsLookupResult => {
  const context = React.useContext(CatalogItemsContext);
  if (context === undefined) {
    throw new Error('useCatalogItemsContext must be used within a CatalogItemsProvider');
  }
  return context;
};

/** Optional context for convenience hooks that fall back to a local lookup. */
export const useOptionalCatalogItemsContext = (): CatalogItemsLookupResult | undefined =>
  React.useContext(CatalogItemsContext);
