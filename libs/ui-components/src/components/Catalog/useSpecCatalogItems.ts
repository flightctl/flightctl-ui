import * as React from 'react';
import type { ApplicationProviderSpec, DeviceSpec } from '@flightctl/types';
import type { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';

import {
  type CatalogItemId,
  extractCatalogItemIdsFromSpec,
  getAppCatalogItemRef,
  resolveCatalogRef,
} from '../../utils/catalog';
import { useOptionalCatalogItemsContext } from './CatalogItemsContext';
import { useCatalogItemsLookup } from './useCatalogItemsLookup';

export type SpecCatalogOsItem = {
  item: CatalogItem;
  version: CatalogItemVersion | undefined;
  channel: string;
  imageUri?: string;
};

export type SpecCatalogAppItem = {
  name: string;
  item: CatalogItem;
  version: CatalogItemVersion | undefined;
  channel: string;
};

export type UseSpecCatalogItemsResult = {
  isLoading: boolean;
  error?: unknown;
  os?: SpecCatalogOsItem;
  apps: SpecCatalogAppItem[];
  getItem: (catalog: string, item: string) => CatalogItem | undefined;
};

/**
 * Resolves all catalog-backed OS and applications on a Device/Fleet template spec.
 */
export const useSpecCatalogItems = (spec: DeviceSpec | undefined): UseSpecCatalogItemsResult => {
  const contextLookup = useOptionalCatalogItemsContext();
  const ids = React.useMemo(() => extractCatalogItemIdsFromSpec(spec), [spec]);
  const localIds = React.useMemo((): CatalogItemId[] => (contextLookup ? [] : ids), [contextLookup, ids]);
  const localLookup = useCatalogItemsLookup(localIds);
  const lookup = contextLookup ?? localLookup;

  const osRef = spec?.os?.catalogItemRef;
  let os: SpecCatalogOsItem | undefined;
  if (osRef) {
    const item = lookup.getItem(osRef.catalog, osRef.item);
    if (item) {
      const resolved = resolveCatalogRef(item, osRef);
      os = {
        item,
        version: resolved.version,
        channel: resolved.channel,
        imageUri: resolved.imageUri,
      };
    }
  }

  const apps: SpecCatalogAppItem[] = [];
  (spec?.applications || []).forEach((app: ApplicationProviderSpec) => {
    const ref = getAppCatalogItemRef(app);
    if (!ref || !app.name) {
      return;
    }
    const item = lookup.getItem(ref.catalog, ref.item);
    if (!item) {
      return;
    }
    const resolved = resolveCatalogRef(item, ref);
    apps.push({
      name: app.name,
      item,
      version: resolved.version,
      channel: resolved.channel,
    });
  });

  return {
    isLoading: lookup.isLoading,
    error: lookup.error,
    os,
    apps,
    getItem: lookup.getItem,
  };
};
