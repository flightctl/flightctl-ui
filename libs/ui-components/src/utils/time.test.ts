import { afterEach, describe, expect, it, vi } from 'vitest';

import { type UpdatePolicyForm } from '../types/deviceSpec';
import { updatePolicyFormToApi } from './patches/patch';
import {
  UpdateScheduleMode,
  assessOneTimeStandingOverlap,
  createEmptyOneTimeWindow,
  durationToMinutes,
  getEndTime,
  groupOneTimeWindowEntries,
  isOneTimeWindowExpired,
  isUiSupportedCron,
  isValidDuration,
  recurringSchedulesAreEqual,
} from './time';

const oneTimePolicyForm = (overrides: Partial<UpdatePolicyForm> = {}): Required<UpdatePolicyForm> =>
  ({
    isCustomized: true,
    downloadAndInstallDiffer: false,
    downloadStartsAt: '00:00',
    downloadStartGraceDuration: '30m',
    downloadScheduleMode: UpdateScheduleMode.Daily,
    downloadWeekDays: [true, true, true, true, true, true, true],
    downloadTimeZone: 'UTC',
    installStartsAt: '00:00',
    installStartGraceDuration: '30m',
    installScheduleMode: UpdateScheduleMode.Daily,
    installWeekDays: [true, true, true, true, true, true, true],
    installTimeZone: 'UTC',
    downloadOneTimeWindows: [],
    installOneTimeWindows: [],
    ...overrides,
  }) as Required<UpdatePolicyForm>;

describe('one-time maintenance window helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts start grace durations in any Go duration form', () => {
    expect(isValidDuration('30m')).toBe(true);
    expect(isValidDuration('24h')).toBe(true);
    expect(isValidDuration('48h')).toBe(true);
    expect(isValidDuration('45s')).toBe(true);
    expect(isValidDuration('1h30m')).toBe(true);
    expect(isValidDuration('300ms')).toBe(true);
    expect(isValidDuration('')).toBe(false);
    expect(isValidDuration('30')).toBe(false);
    expect(isValidDuration('abc')).toBe(false);
  });

  it('parses compound and decimal API durations', () => {
    expect(durationToMinutes('1h30m')).toBe(90);
    expect(durationToMinutes('1.5h')).toBe(90);
    expect(getEndTime('22:00', '1h30m')).toBe('23:30');
  });

  it('defaults a new one-time window to a 30 minute grace duration', () => {
    expect(createEmptyOneTimeWindow().startGraceDuration).toBe('30m');
  });

  it('compares recurring fields independently from one-time windows', () => {
    const recurring = { at: '0 2 * * *', startGraceDuration: '1h', timeZone: 'UTC' };
    expect(
      recurringSchedulesAreEqual(
        { ...recurring, oneTimeWindows: [{ date: '2026-11-24', at: '22:00', startGraceDuration: '1h' }] },
        { ...recurring, oneTimeWindows: [] },
      ),
    ).toBe(true);
    expect(recurringSchedulesAreEqual(recurring, { ...recurring, at: '0 3 * * *' })).toBe(false);
    expect(recurringSchedulesAreEqual(recurring, { ...recurring, startGraceDuration: '2h' })).toBe(false);
  });

  it('expires a window after its grace duration and 24-hour margin', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-21T12:00:00Z'));
    expect(isOneTimeWindowExpired('2026-11-20', '10:00', '1h', 'UTC')).toBe(true);
    expect(isOneTimeWindowExpired('2026-11-20', '10:00', '3h', 'UTC')).toBe(false);
    expect(isOneTimeWindowExpired('2026-11-20', '23:00', '2h', 'UTC')).toBe(false);
    expect(isOneTimeWindowExpired('', '10:00', '1h', 'UTC')).toBe(false);
    expect(isOneTimeWindowExpired('2026-11-20', '10:00', '25h', 'UTC')).toBe(false);
    expect(isOneTimeWindowExpired('2026-11-20', '10:00', 'not-a-duration', 'UTC')).toBe(false);
  });

  it('assesses overlaps with the recurring schedule on the matching weekday', () => {
    const standing = {
      startsAt: '02:00',
      endsAt: '06:00',
      scheduleMode: UpdateScheduleMode.Daily,
      weekDays: [true, true, true, true, true, true, true],
      timeZone: 'UTC',
    };
    expect(assessOneTimeStandingOverlap('2026-11-20', '03:00', '04:00', 'UTC', standing).kind).toBe('likely_covered');
    expect(assessOneTimeStandingOverlap('2026-11-20', '05:00', '07:00', 'UTC', standing).kind).toBe('clock_overlap');
    expect(assessOneTimeStandingOverlap('2026-11-20', '07:00', '08:00', 'UTC', standing).kind).toBe('none');
    expect(assessOneTimeStandingOverlap('2026-11-20', '03:00', '04:00', 'Local', standing).kind).toBe(
      'timezone_uncertain',
    );
  });

  it('groups only pairs of windows that share a date', () => {
    const entry = (date: string, id: string) => ({ window: { date, id }, index: 0 });
    const entries = [
      entry('2026-11-15', 'a'),
      entry('2026-11-15', 'b'),
      entry('2026-11-16', 'c'),
      entry('2026-11-17', 'd'),
      entry('2026-11-17', 'e'),
      entry('2026-11-17', 'f'),
      entry('', 'g'),
      entry('', 'h'),
    ];

    expect(groupOneTimeWindowEntries(entries).map((group) => group.map((item) => item.window.id))).toEqual([
      ['a', 'b'],
      ['c'],
      ['d'],
      ['e'],
      ['f'],
      ['g', 'h'],
    ]);
  });

  it('only treats Daily/Weekly cron expressions as editable', () => {
    expect(isUiSupportedCron('0 4 * * 2,5')).toBe(true);
    expect(isUiSupportedCron('0 4 * * *')).toBe(true);
    expect(isUiSupportedCron('*/15 4 * * *')).toBe(false);
    expect(isUiSupportedCron('0 4 1 * *')).toBe(false);
  });

  it('maps a one-time download window to both schedules when they are shared', () => {
    const form = oneTimePolicyForm({
      downloadOneTimeWindows: [{ id: '1', date: '2026-11-15', startsAt: '22:00', startGraceDuration: '90m' }],
    });
    const policy = updatePolicyFormToApi(form);

    const expectedSchedule = {
      timeZone: 'UTC',
      oneTimeWindows: [{ date: '2026-11-15', at: '22:00', startGraceDuration: '90m' }],
    };
    expect(policy.downloadSchedule).toEqual(expectedSchedule);
    expect(policy.updateSchedule).toEqual(expectedSchedule);
  });

  it('keeps a one-time-only update schedule independent from the download schedule', () => {
    const form = oneTimePolicyForm({
      downloadTimeZone: 'Europe/Madrid',
      installOneTimeWindows: [{ id: '1', date: '2026-11-16', startsAt: '01:00', startGraceDuration: '1h' }],
    });
    const policy = updatePolicyFormToApi(form);

    expect(policy.downloadSchedule).toBeUndefined();
    expect(policy.updateSchedule).toEqual({
      timeZone: 'Europe/Madrid',
      oneTimeWindows: [{ date: '2026-11-16', at: '01:00', startGraceDuration: '1h' }],
    });
  });

  it('edits a one-sided window without creating the missing side', () => {
    const form = oneTimePolicyForm({
      downloadAndInstallDiffer: true,
      downloadOneTimeWindows: [{ id: '1', date: '2026-11-16', startsAt: '01:00', startGraceDuration: '2h' }],
    });
    const policy = updatePolicyFormToApi(form);

    expect(policy.downloadSchedule?.oneTimeWindows).toEqual([
      { date: '2026-11-16', at: '01:00', startGraceDuration: '2h' },
    ]);
    expect(policy.updateSchedule).toBeUndefined();
  });

  it('keeps download and update global timezones separate for one-time windows', () => {
    const form = oneTimePolicyForm({
      downloadCron: '0 2 * * *',
      downloadTimeZone: 'Europe/Madrid',
      installTimeZone: 'UTC',
      installOneTimeWindows: [{ id: '1', date: '2026-11-16', startsAt: '01:00', startGraceDuration: '1h' }],
    });

    const policy = updatePolicyFormToApi(form);

    expect(policy.downloadSchedule?.timeZone).toBe('Europe/Madrid');
    expect(policy.updateSchedule?.timeZone).toBe('UTC');
  });

  it('builds the install recurring schedule from its own fields when schedules differ', () => {
    const form = oneTimePolicyForm({
      downloadAndInstallDiffer: true,
      downloadCron: '0 2 * * *',
      installCron: '0 2 * * *',
      installStartGraceDuration: '2h',
      installScheduleMode: UpdateScheduleMode.Weekly,
      installWeekDays: [false, true, false, true, false, false, false],
      installTimeZone: 'UTC',
    });

    expect(updatePolicyFormToApi(form).updateSchedule).toEqual({
      at: '0 0 * * 1,3',
      startGraceDuration: '2h',
      timeZone: 'UTC',
    });
  });

  it('maps download and update windows independently', () => {
    const form = oneTimePolicyForm({
      downloadOneTimeWindows: [{ id: '1', date: '2026-11-15', startsAt: '22:00', startGraceDuration: '90m' }],
      installOneTimeWindows: [{ id: '2', date: '2026-11-16', startsAt: '01:00', startGraceDuration: '1h' }],
    });
    const policy = updatePolicyFormToApi(form);

    expect(policy.downloadSchedule?.oneTimeWindows).toEqual([
      { date: '2026-11-15', at: '22:00', startGraceDuration: '90m' },
    ]);
    expect(policy.updateSchedule?.oneTimeWindows).toEqual([
      { date: '2026-11-16', at: '01:00', startGraceDuration: '1h' },
    ]);
  });

  it('keeps a newly enabled recurring download window alongside one-time windows', () => {
    const form = oneTimePolicyForm({
      downloadAndInstallDiffer: true,
      downloadCron: '0 0 * * 0,1,2,3,4,5,6',
      downloadStartsAt: '02:00',
      downloadStartGraceDuration: '30m',
      downloadTimeZone: 'Europe/Madrid',
      installCron: '0 0 * * 0,1,2,3,4,5,6',
      installStartGraceDuration: '10m',
      installOneTimeWindows: [{ id: '2', date: '2027-01-12', startsAt: '04:30', startGraceDuration: '45m' }],
      downloadOneTimeWindows: [{ id: '1', date: '2026-11-24', startsAt: '00:00', startGraceDuration: '14m' }],
    });
    const policy = updatePolicyFormToApi(form);

    expect(policy.downloadSchedule).toEqual({
      at: '0 2 * * 0,1,2,3,4,5,6',
      startGraceDuration: '30m',
      timeZone: 'Europe/Madrid',
      oneTimeWindows: [{ date: '2026-11-24', at: '00:00', startGraceDuration: '14m' }],
    });
    expect(policy.updateSchedule?.at).toBe('0 0 * * 0,1,2,3,4,5,6');
    expect(policy.updateSchedule?.oneTimeWindows).toEqual([
      { date: '2027-01-12', at: '04:30', startGraceDuration: '45m' },
    ]);
  });

  it('keeps only one-time windows and timezones after the recurring schedules are removed', () => {
    const form = oneTimePolicyForm({
      downloadAndInstallDiffer: true,
      downloadCron: undefined,
      installCron: undefined,
      downloadTimeZone: 'Europe/Madrid',
      installTimeZone: 'UTC',
      downloadOneTimeWindows: [{ id: '1', date: '2026-11-24', startsAt: '00:00', startGraceDuration: '14m' }],
      installOneTimeWindows: [{ id: '2', date: '2027-01-12', startsAt: '04:30', startGraceDuration: '45m' }],
    });
    const policy = updatePolicyFormToApi(form);

    expect(policy.downloadSchedule).toEqual({
      timeZone: 'Europe/Madrid',
      oneTimeWindows: [{ date: '2026-11-24', at: '00:00', startGraceDuration: '14m' }],
    });
    expect(policy.updateSchedule).toEqual({
      timeZone: 'UTC',
      oneTimeWindows: [{ date: '2027-01-12', at: '04:30', startGraceDuration: '45m' }],
    });
  });

  it('preserves a read-only recurring schedule exactly as loaded', () => {
    const form = oneTimePolicyForm({
      downloadAndInstallDiffer: true,
      downloadCron: '*/15 2 * * *',
      downloadStartGraceDuration: '90s',
      downloadTimeZone: 'Europe/Madrid',
      installCron: '*/15 2 * * *',
      installStartGraceDuration: '90s',
      installTimeZone: 'Europe/Madrid',
    });

    expect(updatePolicyFormToApi(form)).toEqual({
      downloadSchedule: { at: '*/15 2 * * *', startGraceDuration: '90s', timeZone: 'Europe/Madrid' },
      updateSchedule: { at: '*/15 2 * * *', startGraceDuration: '90s', timeZone: 'Europe/Madrid' },
    });
  });

  it('preserves a one-sided recurring schedule without creating the missing side', () => {
    const form = oneTimePolicyForm({
      downloadAndInstallDiffer: true,
      downloadCron: '0 2 * * *',
      downloadStartGraceDuration: '30m',
      downloadTimeZone: 'Europe/Madrid',
    });

    expect(updatePolicyFormToApi(form)).toEqual({
      downloadSchedule: { at: '0 2 * * *', startGraceDuration: '30m', timeZone: 'Europe/Madrid' },
    });
  });

  it('sends the typed recurring start grace duration instead of deriving it from an end time', () => {
    const form = oneTimePolicyForm({
      downloadAndInstallDiffer: true,
      downloadCron: '0 2 * * *',
      downloadStartsAt: '02:00',
      downloadStartGraceDuration: '45m',
      installCron: '0 2 * * *',
      installStartsAt: '02:00',
      installStartGraceDuration: '25h',
    });

    expect(updatePolicyFormToApi(form).downloadSchedule?.startGraceDuration).toBe('45m');
    expect(updatePolicyFormToApi(form).updateSchedule?.startGraceDuration).toBe('25h');
  });

  it('preserves one-time window durations that cannot be derived from an end time', () => {
    const form = oneTimePolicyForm({
      downloadOneTimeWindows: [{ id: '1', date: '2026-11-15', startsAt: '22:00', startGraceDuration: '1h30m' }],
      installOneTimeWindows: [{ id: '2', date: '2026-11-15', startsAt: '22:00', startGraceDuration: '1h30m' }],
    });

    expect(updatePolicyFormToApi(form).downloadSchedule?.oneTimeWindows).toEqual([
      { date: '2026-11-15', at: '22:00', startGraceDuration: '1h30m' },
    ]);
  });
});
