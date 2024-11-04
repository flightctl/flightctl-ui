/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MatchExpression = {
  key: string;
  operator: MatchExpression.operator;
  values?: Array<string>;
};
export namespace MatchExpression {
  export enum operator {
    IN = 'In',
    NOT_IN = 'NotIn',
    EXISTS = 'Exists',
    DOES_NOT_EXIST = 'DoesNotExist',
  }
}

