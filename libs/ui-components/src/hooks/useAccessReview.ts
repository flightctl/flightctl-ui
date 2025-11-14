import * as React from 'react';
import { useAppContext } from './useAppContext';
import { getErrorMessage } from '../utils/error';
import { RESOURCE, VERB } from '../types/rbac';
import type { PermissionCheckRequest, PermissionCheckResponse } from '@flightctl/types';

export type AccessReviewResult = [boolean, boolean, string | undefined];
export type AccessReviewResults = [boolean[], boolean, string | undefined];

export type PermissionCheck = {
  kind: RESOURCE;
  verb: VERB;
};

/**
 * Hook to check multiple permissions in a single API call.
 * @param permissions Array of {kind, verb} pairs to check
 * @returns [results, isLoading, error] where results is an array of booleans in the same order as the input permissions
 */
export const useAccessReview = (permissions: PermissionCheck[]): AccessReviewResults => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const [results, setResults] = React.useState<boolean[]>([]);

  const {
    fetch: { post },
  } = useAppContext();

  // Allows the callers to invoke the hook with new permissions arrays and not to trigger new requests each time
  const permissionKeys = React.useMemo(() => {
    return permissions.map((p) => `${p.kind}:${p.verb}`).join(',');
  }, [permissions]);

  React.useEffect(() => {
    let isMounted = true;

    const checkPermissions = async () => {
      if (!isMounted) {
        return;
      }

      if (permissionKeys.length === 0) {
        setIsLoading(false);
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const request = {
          permissions: permissionKeys.split(',').map((p) => {
            const [kind, verb] = p.split(':');
            return {
              resource: kind,
              op: verb,
            };
          }),
        };
        const response = await post<PermissionCheckRequest, PermissionCheckResponse>('auth/checkpermission', request);
        if (isMounted) {
          // We keep the order in which we requested the permissions, even if the response uses a different order
          const resultsArray = request.permissions.map((reqPerm) => {
            const result = response.results.find((res) => res.resource === reqPerm.resource && res.op === reqPerm.op);
            return result?.allowed ?? false;
          });
          setResults(resultsArray);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
          // Set all results to false on error
          setResults(permissionKeys.split(',').map(() => false));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void checkPermissions();
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [permissionKeys, post]);

  return [results, isLoading, error];
};
