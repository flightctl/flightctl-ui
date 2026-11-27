import { type TFunction } from 'i18next';
import { type Duration, type OneTimeWindow, type UpdateSchedule } from '@flightctl/types';
import { type OneTimeWindowForm, type UpdatePolicyForm } from '../types/deviceSpec';

export const formatTimePart = (val: number | string) => val.toString().padStart(2, '0');

export const getSelectableTimes = () => {
  const times = {};
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${formatTimePart(hour)}:${formatTimePart(minute)}`;
      times[timeString] = timeString;
    }
  }
  return times;
};

export const valid24HourClockRegExp = /^([01]?[0-9]|2[0-3]):?([0-5][0-9])$/;
export const formatted24HourClockRegExp = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
export const defaultStartTime = '00:00';
export const defaultEndTime = '23:59';
export const localDeviceTimezone = 'Local'; // matches the API's default value
const defaultUpdateDuration = '30m';
const oneTimeWindowExpiryMarginMs = 24 * 60 * 60 * 1000;

export enum UpdateScheduleMode {
  Weekly = 'weekly',
  Daily = 'daily',
}

export enum Weekday {
  Sunday = 0,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

enum CronParts {
  Minutes = 0,
  Hours = 1,
  Days = 2,
  Months = 3,
  WeekDays = 4,
}

const DURATION_TOKEN = String.raw`\d+(?:\.\d+)?(?:ns|us|µs|μs|ms|s|m|h)`;
const VALID_DURATION_REGEXP = new RegExp(`^${DURATION_TOKEN}(?:${DURATION_TOKEN})*$`);
const DURATION_UNIT_MINUTES: Record<string, number> = {
  h: 60,
  m: 1,
  s: 1 / 60,
  ms: 1 / 60000,
  us: 1 / 60000,
  µs: 1 / 60000,
  μs: 1 / 60000,
  ns: 1 / 6e10,
};

/** True for a Go duration the API accepts, e.g. "30m", "1h30m", "45s". */
export const isValidDuration = (duration?: string) => Boolean(duration && VALID_DURATION_REGEXP.test(duration));

/** Exact minutes for an API duration. Returns undefined for unparseable values. */
const durationToExactMinutes = (duration?: string): number | undefined => {
  if (!duration) {
    return undefined;
  }
  let total = 0;
  let consumed = 0;
  for (const match of duration.matchAll(/(\d+(?:\.\d+)?)(ns|us|µs|μs|ms|s|m|h)/g)) {
    total += Number(match[1]) * DURATION_UNIT_MINUTES[match[2]];
    consumed += match[0].length;
  }
  return consumed === duration.length ? total : undefined;
};

export const durationToMinutes = (duration: Duration) => Math.round(durationToExactMinutes(duration) ?? 0);

export const getEndTime = (startTime: string, duration?: Duration) => {
  if (startTime === defaultStartTime && !duration) {
    return defaultEndTime;
  }

  const [hours, minutes] = startTime.split(':').map(Number);
  const durationMinutes = durationToMinutes(duration || defaultUpdateDuration);

  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  return `${formatTimePart(newHours)}:${formatTimePart(newMinutes)}`;
};

/** True when cron can be represented as the UI's Daily/Weekly controls. */
export const isUiSupportedCron = (cronExp?: string): boolean => {
  if (!cronExp) {
    return true;
  }
  const tokens = cronExp.split(' ').filter(Boolean);
  if (tokens.length !== 5) {
    return false;
  }
  const [minutes, hours, days, months, weekDays] = tokens;
  if (!/^\d{1,2}$/.test(minutes) || Number(minutes) > 59) {
    return false;
  }
  if (!/^\d{1,2}$/.test(hours) || Number(hours) > 23) {
    return false;
  }
  if (days !== '*' || months !== '*') {
    return false;
  }
  return weekDays === '*' || /^([0-6])(,[0-6])*$/.test(weekDays);
};

// Cron expression example: "0 4 * * 2,5"
export const getTime = (cronExp?: string) => {
  const tokens = (cronExp || '').split(' ').filter(Boolean);

  if (tokens.length !== 5) {
    return defaultStartTime;
  }
  const hours = tokens[CronParts.Hours];
  const minutes = tokens[CronParts.Minutes];

  // Ensure hours and minutes are valid numbers (eg. fails when specifying ranges or steps)
  if (Number.isNaN(Number(hours)) || Number.isNaN(Number(minutes))) {
    return defaultStartTime;
  }

  return `${formatTimePart(hours)}:${formatTimePart(minutes)}`;
};

export const getWeekDays = (cronExp?: string): { allSelected: boolean; selectedDays: boolean[] } => {
  const defaultDays = [true, true, true, true, true, true, true];

  let selectedDays = defaultDays;
  if (cronExp) {
    const weekDayExp = cronExp.split(' ')[CronParts.WeekDays];
    if (weekDayExp !== '*') {
      const days = weekDayExp.split(',').map(Number);
      selectedDays = defaultDays.map((_, index) => {
        return days.includes(index);
      });
    }
  }

  return {
    allSelected: selectedDays.every(Boolean),
    selectedDays,
  };
};

export const getUpdateCronExpression = (startTime: string, scheduleMode: UpdateScheduleMode, weekDays: boolean[]) => {
  const [hours, minutes] = startTime.split(':').map(Number);

  const weekDayVals = weekDays
    .map((isActive, index) => {
      return isActive || scheduleMode === UpdateScheduleMode.Daily ? index : null;
    })
    .filter((num) => num !== null);
  return `${minutes} ${hours} * * ${weekDayVals.join(',')}`;
};

/** A recurring schedule exists when the loaded policy has a cron (`at`) on either schedule. */
export const hasRecurringSchedule = (updatePolicy: Pick<UpdatePolicyForm, 'downloadCron' | 'installCron'>) =>
  Boolean(updatePolicy.downloadCron || updatePolicy.installCron);

/** Cron for a newly added recurring schedule: daily at the default start time. */
export const getDefaultUpdateCron = () =>
  getUpdateCronExpression(defaultStartTime, UpdateScheduleMode.Daily, [true, true, true, true, true, true, true]);

const oneTimeWindowsEqual = (a?: OneTimeWindow[], b?: OneTimeWindow[]) => {
  const left = a || [];
  const right = b || [];
  return (
    left.length === right.length &&
    left.every(
      (window, index) =>
        window.date === right[index].date &&
        window.at === right[index].at &&
        window.startGraceDuration === right[index].startGraceDuration &&
        window.timeZone === right[index].timeZone,
    )
  );
};

export const recurringSchedulesAreEqual = (a: UpdateSchedule | undefined, b: UpdateSchedule | undefined) => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.at !== b.at) {
    return false;
  }
  if ((a.timeZone || localDeviceTimezone) !== (b.timeZone || localDeviceTimezone)) {
    return false;
  }
  if ((a.startGraceDuration || '0s') !== (b.startGraceDuration || '0s')) {
    return false;
  }
  return true;
};

export const schedulesAreEqual = (a: UpdateSchedule | undefined, b: UpdateSchedule | undefined) => {
  if (!recurringSchedulesAreEqual(a, b)) {
    return false;
  }
  if (!a || !b) {
    return true;
  }
  return oneTimeWindowsEqual(a.oneTimeWindows, b.oneTimeWindows);
};

const timeToMinutes = (hhmm: string): number => {
  const [hours, minutes] = (hhmm || '00:00').split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/** True when two [start,end] ranges overlap; supports overnight (end < start). */
export const timeRangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean => {
  const expand = (start: string, end: string): Array<[number, number]> => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return endMinutes > startMinutes
      ? [[startMinutes, endMinutes]]
      : [
          [startMinutes, 24 * 60],
          [0, endMinutes],
        ];
  };

  const aRanges = expand(aStart, aEnd);
  const bRanges = expand(bStart, bEnd);
  return aRanges.some(([aFrom, aTo]) => bRanges.some(([bFrom, bTo]) => aFrom < bTo && bFrom < aTo));
};

export type StandingScheduleFields = {
  startsAt?: string;
  endsAt?: string;
  scheduleMode: UpdateScheduleMode;
  weekDays: boolean[];
  timeZone?: string;
};

export type OneTimeOverlapKind = 'none' | 'clock_overlap' | 'likely_covered' | 'timezone_uncertain';

const normalizeTimeZone = (timeZone?: string) => timeZone || localDeviceTimezone;

const timeRangeContained = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean => {
  const aFrom = timeToMinutes(aStart);
  const aTo = timeToMinutes(aEnd);
  const bFrom = timeToMinutes(bStart);
  const bTo = timeToMinutes(bEnd);
  // Containment is only reliable for same-day standing windows.
  if (bTo <= bFrom || aTo <= aFrom) {
    return false;
  }
  return aFrom >= bFrom && aTo <= bTo;
};

/** Non-blocking overlap assessment between one-time and recurring windows. */
export const assessOneTimeStandingOverlap = (
  date: string,
  startsAt: string,
  endsAt: string,
  oneTimeTimeZone: string | undefined,
  standing: StandingScheduleFields,
): { kind: OneTimeOverlapKind } => {
  if (!date || !startsAt || !endsAt || !standing.startsAt || !standing.endsAt) {
    return { kind: 'none' };
  }
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return { kind: 'none' };
  }
  const weekday = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
  const appliesThatDay = standing.scheduleMode === UpdateScheduleMode.Daily || Boolean(standing.weekDays[weekday]);
  if (!appliesThatDay) {
    return { kind: 'none' };
  }
  if (normalizeTimeZone(oneTimeTimeZone) !== normalizeTimeZone(standing.timeZone)) {
    return { kind: 'timezone_uncertain' };
  }
  if (!timeRangesOverlap(startsAt, endsAt, standing.startsAt, standing.endsAt)) {
    return { kind: 'none' };
  }
  return {
    kind: timeRangeContained(startsAt, endsAt, standing.startsAt, standing.endsAt) ? 'likely_covered' : 'clock_overlap',
  };
};

export const createEmptyOneTimeWindow = (): OneTimeWindowForm => ({
  id: `otw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  date: '',
  startsAt: defaultStartTime,
  startGraceDuration: defaultUpdateDuration,
});

export const getOneTimeWindowTimeText = (window: Pick<OneTimeWindowForm, 'startsAt' | 'startGraceDuration'>) =>
  window.startGraceDuration ? `${window.startsAt} + ${window.startGraceDuration}` : window.startsAt;

/**
 * Groups windows sharing a date into one entry, unless more than two share it.
 * Undated windows (just added) share the empty date until one is picked.
 */
export const groupOneTimeWindowEntries = <T extends { window: Pick<OneTimeWindowForm, 'date'> }>(
  entries: T[],
): T[][] => {
  const groups: T[][] = [];
  const groupsByDate = new Map<string, T[]>();
  entries.forEach((entry) => {
    const dateGroup = groupsByDate.get(entry.window.date);
    if (dateGroup) {
      dateGroup.push(entry);
    } else {
      const group = [entry];
      groups.push(group);
      groupsByDate.set(entry.window.date, group);
    }
  });
  return groups.flatMap((group) => (group.length > 2 ? group.map((entry) => [entry]) : [group]));
};

const utcEpoch = (year: number, month: number, day: number, hour: number, minute: number) => {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, 0, 0);
  return date.getTime();
};

const oneTimeWindowStart = (date: string, startsAt: string, timeZone: string): number | undefined => {
  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = startsAt.match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) {
    return undefined;
  }

  const [, yearText, monthText, dayText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const target = utcEpoch(year, month, day, hour, minute);
  const check = new Date(target);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    return undefined;
  }

  const formatter = new Intl.DateTimeFormat('en-US-u-ca-iso8601-hc-h23-nu-latn', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const localParts = (instant: number) => {
    const parts: Record<string, string> = {};
    formatter.formatToParts(new Date(instant)).forEach(({ type, value }) => {
      parts[type] = value;
    });
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: Number(parts.hour),
      minute: Number(parts.minute),
    };
  };
  const matchesTarget = (instant: number) => {
    const parts = localParts(instant);
    return (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      parts.hour === hour &&
      parts.minute === minute
    );
  };

  const offsets = new Set<number>();
  for (const delta of [-36, 0, 36]) {
    const sample = target + delta * 60 * 60 * 1000;
    const parts = localParts(sample);
    offsets.add(
      utcEpoch(parts.year, parts.month, parts.day, parts.hour, parts.minute) - Math.floor(sample / 60000) * 60000,
    );
  }
  const matches = [...offsets].map((offset) => target - offset).filter(matchesTarget);
  return matches.length === 1 ? matches[0] : undefined;
};

/** Keep all one-time windows active for 24 hours after their scheduled end. */
export const isOneTimeWindowExpired = (
  date: string,
  startsAt: string,
  startGraceDuration: string,
  timeZone: string,
): boolean => {
  if (!date || !timeZone) {
    return false;
  }
  const durationMinutes = durationToExactMinutes(startGraceDuration);
  if (durationMinutes === undefined) {
    return false;
  }
  try {
    const isDeviceLocal = timeZone === localDeviceTimezone;
    // shortcut: resolve Local against UTC until per-device timezone data is available.
    const start = oneTimeWindowStart(date, startsAt, isDeviceLocal ? 'UTC' : timeZone);
    return (
      start !== undefined &&
      start + durationMinutes * 60 * 1000 + oneTimeWindowExpiryMarginMs < Date.now()
    );
  } catch {
    return false;
  }
};

export type UpdateScheduleDisplayFields = {
  startsAt?: string;
  endsAt?: string;
  scheduleMode: UpdateScheduleMode;
  weekDays: boolean[];
  timeZone?: string;
  startGraceDuration?: string;
};

const getWeekDayShortLabels = (t: TFunction) => [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')];

export const getScheduleUpdateText = (schedule: UpdateScheduleDisplayFields, t: TFunction): string => {
  const start = schedule.startsAt || defaultStartTime;
  const end = schedule.endsAt || defaultEndTime;
  const timeZone =
    !schedule.timeZone || schedule.timeZone === localDeviceTimezone ? t("device's local timezone") : schedule.timeZone;

  let scheduleText: string;
  if (schedule.scheduleMode === UpdateScheduleMode.Weekly) {
    const dayLabels = getWeekDayShortLabels(t);
    const days = schedule.weekDays
      .map((isSelected, index) => (isSelected ? dayLabels[index] : null))
      .filter(Boolean)
      .join(', ');
    scheduleText = t('Weekly on {{ days }} from {{ start }} to {{ end }} ({{ timeZone }})', {
      days: days || '-',
      start,
      end,
      timeZone,
    });
  } else {
    scheduleText = t('Daily from {{ start }} to {{ end }} ({{ timeZone }})', {
      start,
      end,
      timeZone,
    });
  }

  if (schedule.startGraceDuration && schedule.startGraceDuration !== '0s') {
    return t('{{ schedule }}, grace {{ duration }}', {
      schedule: scheduleText,
      duration: schedule.startGraceDuration,
    });
  }

  return scheduleText;
};

// Adds an artificial delay to make sure that the user notices the data is refreshing.
export const showSpinnerBriefly = (time: number = 450) => new Promise((resolve) => setTimeout(resolve, time));
