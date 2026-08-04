import * as React from 'react';
import type { ApplicationProviderSpec, CatalogItemRefSpec, DeviceSpec } from '@flightctl/types';
import type { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';

import {
  type CatalogItemId,
  extractCatalogItemIdsFromSpec,
  getAppCatalogItemRef,
  resolveCatalogRef,
} from '../../utils/catalog';
import { useOptionalCatalogItemsContext } from './CatalogItemsContext';
import { useCatalogItemsLookup } from './useCatalogItemsLookup';

export type ResolvedCatalogItemData = {
  item: CatalogItem;
  version: CatalogItemVersion | undefined;
  channel: string;
};

export type SpecOsCatalogItem = {
  ref: CatalogItemRefSpec;
  data?: ResolvedCatalogItemData & { imageUri?: string };
};

export type SpecAppCatalogItem = {
  ref: CatalogItemRefSpec;
  appName: string;
  data?: ResolvedCatalogItemData;
};

export type UseSpecCatalogItemsResult = {
  isLoading: boolean;
  error?: unknown;
  os?: SpecOsCatalogItem;
  apps: SpecAppCatalogItem[];
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
  let os: SpecOsCatalogItem | undefined;
  if (osRef) {
    const item = lookup.getItem(osRef.catalog, osRef.item);
    let osData: SpecOsCatalogItem['data'] | undefined;
    if (item) {
      const resolved = resolveCatalogRef(item, osRef);
      osData = {
        item,
        version: resolved.version,
        channel: resolved.channel,
        imageUri: resolved.imageUri,
      };
    }
    os = {
      ref: osRef,
      data: osData,
    };
  }

  const apps: SpecAppCatalogItem[] = [];
  (spec?.applications || []).forEach((app: ApplicationProviderSpec) => {
    const appRef = getAppCatalogItemRef(app);
    if (!appRef || !app.name) {
      return;
    }
    const item = lookup.getItem(appRef.catalog, appRef.item);
    let appData: SpecAppCatalogItem['data'] | undefined;
    if (item) {
      const resolved = resolveCatalogRef(item, appRef);
      appData = {
        item,
        version: resolved.version,
        channel: resolved.channel,
      };
    }
    apps.push({
      appName: app.name,
      ref: appRef,
      data: appData,
    });
  });

  return {
    isLoading: lookup.isLoading,
    error: lookup.error,
    os,
    apps,
  };
};
