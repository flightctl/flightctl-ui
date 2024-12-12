/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * "Cron expression format for scheduling times. The format is `* * * * *`: - Minutes: `*` matches 0-59. - Hours: `*` matches 0-23. - Day of Month: `*` matches 1-31. - Month: `*` matches 1-12. - Day of Week: `*` matches 0-6."
 * Supported operators: - `*`: Matches any value (e.g., `*` in hours matches every hour). - `-`: Range (e.g., `0-8` for 12 AM to 8 AM). - `,`: List (e.g., `1,12` for 1st and 12th minute). - `/`: Step (e.g., `*12` for every 12th minute). - Single value (e.g., `8` matches the 8th minute)." example: "* 0-8,16-23 * * *"
 *
 */
export type CronExpression = string;
