import * as React from 'react';

const RELOAD_ATTEMPTED_KEY = 'flightctl-chunk-reload-attempted';

/**
 * Returns true only the first time it is called within a tab, recording a marker in
 * sessionStorage so the decision survives the full page reload it triggers. Every later call
 * returns false, capping auto-recovery at a single reload per tab and preventing reload loops
 * (several lazy components can fail on the same screen). If sessionStorage is unavailable we
 * return false, erring towards the ErrorBoundary rather than risking a loop.
 */
export const shouldReloadOnce = (): boolean => {
  try {
    if (window.sessionStorage.getItem(RELOAD_ATTEMPTED_KEY)) {
      return false;
    }
    window.sessionStorage.setItem(RELOAD_ATTEMPTED_KEY, 'true');
    return true;
  } catch {
    return false;
  }
};

/**
 * Detects a chunk-load failure, i.e. the hashed bundle could not be fetched (404/504 after a
 * redeploy). webpack throws an Error named "ChunkLoadError"; we also match the message to cover
 * CSS chunks and webpack version differences. Any other rejection (e.g. an error thrown while
 * the module evaluates) is a real bug that a reload would only hide, so it is left alone.
 */
const isChunkLoadError = (error: unknown): boolean =>
  error instanceof Error && (error.name === 'ChunkLoadError' || /Loading (CSS )?chunk .* failed/i.test(error.message));

/**
 * Wrapper around React.lazy that recovers from stale chunk-load failures after a UI
 * redeployment. When the UI service restarts, the hashed bundles referenced by an already
 * open tab no longer exist on the server, so the dynamic import() fails (404/504). React.lazy
 * caches that rejection, which makes the error "sticky" across navigation.
 *
 * Reloading the same hashed URL cannot succeed (the file is gone); only a full page reload
 * fetches a fresh index.html with the new chunk names. So on a chunk-load failure we trigger a
 * single guarded full page reload. If the import still fails right after reloading, the error
 * is rethrown and the ErrorBoundary shows its "Reload page" action instead of looping.
 */
export function lazyWithReload(
  importer: () => Promise<{ default: React.ComponentType }>,
): React.LazyExoticComponent<React.ComponentType> {
  return React.lazy(() =>
    importer().catch((error: unknown) => {
      // Check the error type before shouldReloadOnce() so non-chunk errors don't consume the
      // one-shot reload marker.
      if (isChunkLoadError(error) && shouldReloadOnce()) {
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
