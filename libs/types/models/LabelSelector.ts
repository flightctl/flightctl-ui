/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MatchExpressions } from './MatchExpressions';
/**
 * A map of key,value pairs that are ANDed. Empty/null label selectors match nothing.
 */
export type LabelSelector = {
  matchLabels?: Record<string, string>;
  matchExpressions?: MatchExpressions;
};

