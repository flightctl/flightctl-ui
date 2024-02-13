import { ApiQuery, FlightControlQuery, MetricsQuery } from '@app/types/extraTypes';
import { getPeriodTimestamps } from '@app/utils/metrics';

const isApiQuery = (query: ApiQuery | MetricsQuery): query is ApiQuery => 'endpoint' in query;

const getApiQueryString = (apiQuery: ApiQuery) => apiQuery.endpoint;

const getMetricsQueryString = (metricsQuery: MetricsQuery) => {
  const { metrics, period } = metricsQuery;
  const range = getPeriodTimestamps(period);

  let query = metrics.length === 1 ? metrics[0] : `__name__=~"${metrics.join('|')}"`;
  if (range) {
    query += `&start=${range.from}&end=${range.to}&step=${range.step}`;
  }
  return query;
};

/**
 * Builds the query string hash that identifies this query based only on its parameters
 * @param queryObj
 */
const getQueryStringHash = (queryObj: FlightControlQuery) => {
  if (isApiQuery(queryObj)) {
    return getApiQueryString(queryObj);
  }
  // We just need to generate a unique string based on the data, but without the timestamps
  return `metric=${queryObj.metrics.join(',')}&period=${queryObj.period}`;
};

/**
 * Builds the query string that should be triggered, adding time parameters etc to the base query string
 * @param queryObj
 */
const getRequestQueryString = (queryObj: FlightControlQuery) => {
  if (isApiQuery(queryObj)) {
    return getApiQueryString(queryObj);
  }
  return getMetricsQueryString(queryObj);
};

export { isApiQuery, getRequestQueryString, getQueryStringHash, getApiQueryString, getMetricsQueryString };
