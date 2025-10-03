import upperFirst from 'lodash/upperFirst';
import toLower from 'lodash/toLower';

import type { Condition } from '@flightctl/types';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || '';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof String) {
    return error.toString();
  }
  return 'Unexpected error';
};

const uppercaseSentence = (s: string | undefined) => (s ? upperFirst(toLower(s)) : '');

export const getConditionMessage = (condition: Condition, reason?: string): string =>
  [uppercaseSentence(reason || condition.reason), uppercaseSentence(condition.message)]
    .filter((msg) => !!msg)
    .join('. ');

export const isResourceVersionTestFailure = (error: unknown): boolean => {
  const errorMessage = getErrorMessage(error);
  return errorMessage.includes('Error 400') && errorMessage.includes('/metadata/resourceVersion');
};
