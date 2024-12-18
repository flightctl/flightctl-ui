/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MatchExpressions } from './MatchExpressions';
/**
 * A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. Empty/null label selectors match nothing.
 */
export type LabelSelector = {
  /**
   * A map of {key,value} pairs.
   */
  matchLabels?: Record<string, string>;
  matchExpressions?: MatchExpressions;
};

