import { describe, expect, it } from 'vitest';

import { getUpdatePolicyValues } from './fleetSpecUtils';
import { getFleetResource, getInitialValues } from './utils';
import { getUpdatePolicyPatches } from '../../../utils/patches/patch';

describe('getFleetResource', () => {
  it('keeps user-defined fleet metadata labels on the fleet resource', () => {
    const resource = getFleetResource({
      ...getInitialValues(),
      name: 'edge-fleet',
      fleetLabels: [{ key: 'environment', value: 'production' }],
    });

    expect(resource.metadata).toEqual({
      name: 'edge-fleet',
      labels: { environment: 'production' },
    });
    expect(resource.spec.template.metadata).toBeUndefined();
  });

  it('does not copy long fleet names into template labels', () => {
    const name = `fleet-${'a'.repeat(100)}`;
    const resource = getFleetResource({ ...getInitialValues(), name });

    expect(resource.metadata.name).toBe(name);
    expect(resource.spec.template.metadata).toBeUndefined();
  });

  it('keeps one-time download and update schedules separate when their timezones differ', () => {
    const values = getUpdatePolicyValues({
      downloadSchedule: {
        timeZone: 'Europe/Madrid',
        oneTimeWindows: [{ date: '2026-11-24', at: '00:00', startGraceDuration: '14m' }],
      },
      updateSchedule: {
        timeZone: 'UTC',
        oneTimeWindows: [{ date: '2027-01-12', at: '04:30', startGraceDuration: '45m' }],
      },
    });

    expect(values.downloadAndInstallDiffer).toBe(true);
    expect(values.installTimeZone).toBe('UTC');
  });

  it('keeps the recurring schedules combined when only one-time window times differ', () => {
    const values = getUpdatePolicyValues({
      downloadSchedule: {
        at: '0 2 * * *',
        startGraceDuration: '1h',
        timeZone: 'UTC',
        oneTimeWindows: [{ date: '2026-11-24', at: '22:00', startGraceDuration: '1h' }],
      },
      updateSchedule: {
        at: '0 2 * * *',
        startGraceDuration: '1h',
        timeZone: 'UTC',
        oneTimeWindows: [{ date: '2026-11-24', at: '23:00', startGraceDuration: '1h' }],
      },
    });

    expect(values.downloadAndInstallDiffer).toBe(false);
  });

  it('keeps a one-sided recurring schedule unchanged when saving', () => {
    const currentPolicy = { downloadSchedule: { at: '0 2 * * *', startGraceDuration: '1h' } };
    const values = getUpdatePolicyValues(currentPolicy);

    expect(values.downloadAndInstallDiffer).toBe(true);
    expect(getUpdatePolicyPatches('/updatePolicy', currentPolicy, values as Required<typeof values>)).toEqual([]);
  });

  it('keeps compound API grace durations for editing', () => {
    const values = getUpdatePolicyValues({
      downloadSchedule: { at: '0 2 * * *', startGraceDuration: '1h30m' },
    });

    expect(values.downloadStartGraceDuration).toBe('1h30m');
  });

  it('keeps individual one-sided windows unchanged when saving an otherwise untouched policy', () => {
    const currentPolicy = {
      downloadSchedule: {
        timeZone: 'Europe/Madrid',
        oneTimeWindows: [{ date: '2026-11-24', at: '22:00', startGraceDuration: '45s' }],
      },
      updateSchedule: {
        timeZone: 'Europe/Madrid',
        oneTimeWindows: [{ date: '2026-11-25', at: '01:00', startGraceDuration: '2h' }],
      },
    };
    const values = getUpdatePolicyValues(currentPolicy);

    expect(getUpdatePolicyPatches('/updatePolicy', currentPolicy, values as Required<typeof values>)).toEqual([]);
  });
});
