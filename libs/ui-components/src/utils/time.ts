import { Duration } from '@flightctl/types';

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

export const durationToMinutes = (duration: Duration) => {
  const timeoutVal = Number(duration.replace(/[shm]/, ''));
  if (!timeoutVal) {
    return 0;
  }

  if (duration.includes('s')) {
    return Math.round(timeoutVal / 60);
  }
  if (duration.includes('h')) {
    return Math.round(timeoutVal * 60);
  }
  return timeoutVal;
};

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
