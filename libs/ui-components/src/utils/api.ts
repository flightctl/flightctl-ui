import { Condition, ConditionStatus, ConditionType, ListMeta, ObjectMeta } from '@flightctl/types';

import { AnnotationType, ApiQuery, FlightControlQuery, MetricsQuery } from '../types/extraTypes';
import { getPeriodTimestamps } from '../utils/metrics';

const isApiQuery = (query: ApiQuery | MetricsQuery): query is ApiQuery => 'endpoint' in query;

const getApiQueryString = (apiQuery: ApiQuery) => apiQuery.endpoint;

const getMetricsQueryString = (metricsQuery: MetricsQuery) => {
  const { metrics, period } = metricsQuery;
  const range = getPeriodTimestamps(period);

  const metric = metrics.length === 1 ? metrics[0] : `__name__=~"${metrics.join('|')}"`;
  let query = `query=${metric}`;
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

export interface ApiList<R> {
  items: Array<R>;
  metadata: ListMeta;
}

const getApiListCount = <T>(listResponse: ApiList<T> | undefined): number | undefined => {
  if (listResponse === undefined) {
    return undefined;
  }
  const hasItems = listResponse.items.length > 0;
  const extraItems = listResponse.metadata.remainingItemCount || 0;
  return hasItems ? 1 + extraItems : 0;
};

const getMetadataAnnotation = (metadata: ObjectMeta | undefined, annotation: AnnotationType) => {
  if (metadata?.annotations) {
    return metadata.annotations[annotation];
  }
  return undefined;
};

const getCondition = (
  conditions: Condition[] | undefined,
  type: ConditionType,
  status: ConditionStatus = ConditionStatus.ConditionStatusTrue,
) => {
  const typeCond = conditions?.filter((c) => c.type === type);
  if (typeCond) {
    return typeCond.find((tc) => tc.status === status);
  }
  return undefined;
};

export {
  isApiQuery,
  getRequestQueryString,
  getQueryStringHash,
  getMetadataAnnotation,
  getApiQueryString,
  getMetricsQueryString,
  getApiListCount,
  getCondition,
};
