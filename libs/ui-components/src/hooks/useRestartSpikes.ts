import * as React from 'react';

/** Minimum total restart increase since the page was opened that triggers a warning. */
export const RESTART_SPIKE_THRESHOLD = 20;

const EMPTY_SPIKES: Record<string, number> = {};

type AppRestartInput = {
  name: string;
  restarts: number;
};

/**
 * Tracks per-app restart counts for the current mount session.
 * Returns a stable map of app name → session increase for apps that met `threshold`.
 *
 * Cheap by design: fingerprint ignores non-restart status fields, skips setState when
 * the spike set is unchanged, and uses no timers or intervals.
 */
export const useRestartSpikes = (apps: AppRestartInput[]): Record<string, number> => {
  const baselineRef = React.useRef<Record<string, number>>({});
  const appsRef = React.useRef(apps);
  appsRef.current = apps;

  const [spikes, setSpikes] = React.useState<Record<string, number>>(EMPTY_SPIKES);

  // Fingerprint only name+restarts so unrelated status field churn does not re-run detection.
  const restartSnapshot = apps
    .map((app) => `${app.name}:${app.restarts}`)
    .sort()
    .join('|');

  React.useEffect(() => {
    const currentApps = appsRef.current;
    const nextSpikes: Record<string, number> = {};
    const seen = new Set<string>();

    for (const app of currentApps) {
      seen.add(app.name);
      const baseline = baselineRef.current[app.name];

      // First sight, or restart counter reset (e.g. app recreated) → new baseline.
      if (baseline === undefined || app.restarts < baseline) {
        baselineRef.current[app.name] = app.restarts;
        continue;
      }

      const sessionIncrease = app.restarts - baseline;
      if (sessionIncrease >= RESTART_SPIKE_THRESHOLD) {
        nextSpikes[app.name] = sessionIncrease;
      }
    }

    for (const name of Object.keys(baselineRef.current)) {
      if (!seen.has(name)) {
        delete baselineRef.current[name];
      }
    }

    setSpikes((current) => {
      const nextKeys = Object.keys(nextSpikes);
      if (nextKeys.length === 0) {
        return Object.keys(current).length === 0 ? current : EMPTY_SPIKES;
      }
      const currentKeys = Object.keys(current);
      if (currentKeys.length === nextKeys.length && nextKeys.every((name) => current[name] === nextSpikes[name])) {
        return current;
      }
      return nextSpikes;
    });
  }, [restartSnapshot]);

  return spikes;
};
