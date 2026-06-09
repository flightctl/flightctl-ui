import * as React from 'react';
import type { Permission, PermissionList } from '@flightctl/types';
import { RESOURCE, VERB } from '../../types/rbac';
import { useFetch } from '../../hooks/useFetch';
import { useOrganizationGuardContext } from './OrganizationGuard';

export type PermissionCheck = {
  kind: RESOURCE;
  verb: VERB;
};

const isVerbAllowed = (operations: string[], verb: string): boolean =>
  operations.includes('*') || operations.includes(verb);

/**
 * Helper function to check if a permission (resource + verb) is allowed
 *
 * Handles wildcards: "*" in resource means all resources, "*" in operations means all operations
 * Handles exceptions to the wildcard rules, e.g. "operations":[],"resource":"devices/console" prevents the user from accessing the device console.
 */
const isPermissionAllowed = (userPermissions: Permission[], permissionCheck: PermissionCheck): boolean => {
  const kindPermissions = userPermissions.filter((permission) => permission.resource === permissionCheck.kind);

  // Check for explicit permission denial for this resource (kind)
  if (kindPermissions.some((permission) => permission.operations.length === 0)) {
    return false;
  }

  // Check for explicit permission grant for this resource (kind) and verb
  if (kindPermissions.some((permission) => isVerbAllowed(permission.operations, permissionCheck.verb))) {
    return true;
  }

  // If there are no exceptions for this resource/verb, check for wildcard permissions
  const wildcardPermissions = userPermissions.filter((permission) => permission.resource === '*');
  return wildcardPermissions.some((p) => isVerbAllowed(p.operations, permissionCheck.verb));
};

export type PermissionsContextType = {
  loading: boolean;
  error: string | undefined;
  checkPermissions: (permissions: PermissionCheck[]) => boolean[];
};

const PermissionsContext = React.createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsContextProvider = ({ children }: React.PropsWithChildren) => {
  const [userPermissions, setUserPermissions] = React.useState<Permission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();
  const { currentOrganization } = useOrganizationGuardContext();

  const orgId = currentOrganization?.id;

  const { get } = useFetch();

  React.useEffect(() => {
    const abortController = new AbortController();

    const loadPermissions = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const response = await get<PermissionList>('auth/permissions', abortController.signal);
        if (!abortController.signal.aborted) {
          setUserPermissions(response.permissions);
        }
      } catch (err) {
        // Ignore abort errors - they're expected when organization changes
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
          setUserPermissions([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (orgId) {
      void loadPermissions();
    }

    // Cleanup: abort the request if the organization changes or component unmounts
    return () => {
      abortController.abort();
    };
  }, [get, orgId]);

  const checkPermissions = React.useCallback(
    (permissionChecks: PermissionCheck[]): boolean[] =>
      permissionChecks.map((permissionCheck) => isPermissionAllowed(userPermissions, permissionCheck)),
    [userPermissions],
  );

  const value = React.useMemo(
    () => ({
      loading,
      error,
      checkPermissions,
    }),
    [loading, error, checkPermissions],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const usePermissionsContext = (): PermissionsContextType => {
  const context = React.useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsContextProvider');
  }
  return context;
};
