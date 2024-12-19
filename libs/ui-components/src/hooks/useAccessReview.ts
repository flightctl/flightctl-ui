import * as React from 'react';
import { useAppContext } from './useAppContext';
import { getErrorMessage } from '../utils/error';
import { RESOURCE, VERB } from '../types/rbac';

export type AccessReviewResult = [boolean, boolean, string | undefined];

export const useAccessReview = (kind: RESOURCE, verb: VERB): AccessReviewResult => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const [isAllowed, setIsAllowed] = React.useState(false);

  const {
    fetch: { checkPermissions },
  } = useAppContext();
  React.useEffect(() => {
    const doItAsync = async () => {
      setIsLoading(true);
      try {
        const allowed = await checkPermissions(kind, verb);
        setIsAllowed(allowed);
      } catch (err) {
        setError(getErrorMessage(err));
        setIsAllowed(false);
      } finally {
        setIsLoading(false);
      }
    };
    doItAsync();
  }, [kind, verb, checkPermissions]);

  return [isAllowed, isLoading, error];
};
