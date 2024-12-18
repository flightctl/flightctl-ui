/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MatchExpression = {
  /**
   * The label key that the selector applies to.
   */
  key: string;
  /**
   * The operation to apply when matching.
   */
  operator: MatchExpression.operator;
  /**
   * The list of values to match.
   */
  values?: Array<string>;
};
export namespace MatchExpression {
  /**
   * The operation to apply when matching.
   */
  export enum operator {
    IN = 'In',
    NOT_IN = 'NotIn',
    EXISTS = 'Exists',
    DOES_NOT_EXIST = 'DoesNotExist',
  }
}

