import * as React from 'react';

const RELOAD_TIMESTAMP_KEY = 'flightctl-chunk-reload-ts';

/**
 * Only auto-reload once within this window. If a chunk import keeps failing right after a
 * reload the cause is not a stale chunk (which a reload fixes), so we stop reloading and let
 * the ErrorBoundary surface the error instead of looping.
 */
const RELOAD_WINDOW_MS = 10_000;

/**
 * Returns true at most once per RELOAD_WINDOW_MS. The timestamp is kept in sessionStorage so
 * the guard survives the full page reload it triggers. If sessionStorage is unavailable we
 * return false, erring towards the ErrorBoundary rather than risking a reload loop.
 */
export const shouldReloadOnce = (now: number = Date.now()): boolean => {
  try {
    const last = window.sessionStorage.getItem(RELOAD_TIMESTAMP_KEY);
    if (last && now - Number(last) < RELOAD_WINDOW_MS) {
      return false;
    }
    window.sessionStorage.setItem(RELOAD_TIMESTAMP_KEY, String(now));
    return true;
  } catch {
    return false;
  }
};

/**
 * Wrapper around React.lazy that recovers from stale chunk-load failures after a UI
 * redeployment. When the UI service restarts, the hashed bundles referenced by an already
 * open tab no longer exist on the server, so the dynamic import() fails (404/504). React.lazy
 * caches that rejection, which makes the error "sticky" across navigation.
 *
 * Reloading the same hashed URL cannot succeed (the file is gone); only a full page reload
 * fetches a fresh index.html with the new chunk names. So on a load failure we trigger a
 * single guarded full page reload. If it still fails right after reloading, the error is
 * rethrown and the ErrorBoundary shows its "Reload page" action instead of looping.
 */
export function lazyWithReload(
  importer: () => Promise<{ default: React.ComponentType }>,
): React.LazyExoticComponent<React.ComponentType> {
  return React.lazy(() =>
    importer().catch((error: unknown) => {
      if (shouldReloadOnce()) {
        window.location.reload();
        // Keep <Suspense> in its loading state until the reload takes effect.
        return new Promise<{ default: React.ComponentType }>(() => {
          /* never resolves */
        });
      }
      throw error;
    }),
  );
}
