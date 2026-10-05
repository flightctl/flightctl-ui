import * as React from 'react';

import type { LabelSyncProvenanceItem, LabelSyncProvenanceList } from '@flightctl/types';
import { commonQueries } from '../utils/query';
import { useFetch } from './useFetch';
import type { FlightCtlLabel } from '../types/extraTypes';

const MAX_LABEL_KEYS = 50;

type LabelSyncProvenanceKeysResult = {
  managedKeys: string[];
  isManagedLabel: (key: string) => boolean;
  isLoading: boolean;
  error: unknown;
};

const uniqueNonEmptyKeys = (labels: FlightCtlLabel[]): string[] => {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const label of labels) {
    const key = label.key;
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(key);
    if (unique.length >= MAX_LABEL_KEYS) {
      break;
    }
  }
  return unique;
};

// TODO EDM-4870 API contract does not fully allow the desired UX.
// Since the API always returns a LabelSyncProvenanceItem for each key in the request, it's not possible to distinguish between these two cases:
// 1. The label is not managed by LabelSync.
// 2. The label is managed by LabelSync, but no device has reported the value for it.
// The user could define a Fleet upfront using label selectors that match an existing LabeLSyncMappings resource,
// but unless at least one device reports the value associated with that label, it would be displayed as a normal label, not as a managed one.
const isLabelManagedByLabelSync = (item: LabelSyncProvenanceItem) => (item.owners?.length || 0) > 0;

export const useLabelKeyProvenance = (labels: FlightCtlLabel[]): LabelSyncProvenanceKeysResult => {
  const { get } = useFetch();
  const nextKeysUnstable = uniqueNonEmptyKeys(labels);
  const keysFingerprint = nextKeysUnstable.join('\0');
  // Use keysFingerprint as the dependency, and return a stable list derived from "nextKeysUnstable".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nextKeysStable = React.useMemo(() => nextKeysUnstable, [keysFingerprint]);

  const [fetchedManagedKeys, setFetchedManagedKeys] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>();

  React.useEffect(() => {
    if (nextKeysStable.length === 0) {
      setFetchedManagedKeys([]);
      setIsLoading(false);
      setError(undefined);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);
    setError(undefined);

    const fetchProvenance = async () => {
      try {
        const response = await get<LabelSyncProvenanceList>(
          commonQueries.getOrgLabelSyncProvenance(nextKeysStable),
          abortController.signal,
        );
        if (abortController.signal.aborted) {
          return;
        }
        const owned = (response.items || []).filter(isLabelManagedByLabelSync).map((item) => item.key);
        setFetchedManagedKeys(owned);
        setError(undefined);
      } catch (e) {
        if (abortController.signal.aborted) {
          return;
        }
        setFetchedManagedKeys([]);
        setError(e);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProvenance();

    return () => {
      abortController.abort();
    };
  }, [nextKeysStable, get]);

  // Drop stale keys from a previous provenance response while a new fetch is in flight.
  const managedKeys = React.useMemo(
    () => fetchedManagedKeys.filter((key) => nextKeysStable.includes(key)),
    [fetchedManagedKeys, nextKeysStable],
  );
  const managedKeySet = React.useMemo(() => new Set(managedKeys), [managedKeys]);
  const isManagedLabel = React.useCallback((key: string) => managedKeySet.has(key), [managedKeySet]);

  return {
    managedKeys,
    isManagedLabel,
    isLoading: nextKeysStable.length > 0 && isLoading,
    error,
  };
};

export default useLabelKeyProvenance;
