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
    let isMounted = true;

    const doItAsync = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      try {
        const allowed = await checkPermissions(kind, verb);
        if (isMounted) {
          setIsAllowed(allowed);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
          setIsAllowed(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    doItAsync();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [kind, verb, checkPermissions]);

  return [isAllowed, isLoading, error];
};
