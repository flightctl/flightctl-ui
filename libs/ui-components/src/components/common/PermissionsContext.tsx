import * as React from 'react';
import type { Permission, PermissionList } from '@flightctl/types';
import { RESOURCE, VERB } from '../../types/rbac';
import { useFetch } from '../../hooks/useFetch';
import { useOrganizationGuardContext } from './OrganizationGuard';

export type PermissionCheck = {
  kind: RESOURCE;
  verb: VERB;
};

/**
 * Helper function to check if a permission (resource + verb) is allowed
 * Handles wildcards: "*" in resource means all resources, "*" in operations means all operations
 */
const isPermissionAllowed = (userPermissions: Permission[], permissionCheck: PermissionCheck): boolean => {
  for (const permission of userPermissions) {
    // Check if resource matches (exact match or wildcard)
    const resourceMatches = permission.resource === '*' || permission.resource === permissionCheck.kind;
    if (resourceMatches) {
      // Check if operation/verb matches (exact match or wildcard)
      const verbMatches = permission.operations.includes('*') || permission.operations.includes(permissionCheck.verb);
      if (verbMatches) {
        return true;
      }
    }
  }

  return false;
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

  const { get } = useFetch();

  React.useEffect(() => {
    const abortController = new AbortController();

    const loadPermissions = async () => {
      // Only fetch permissions when an organization has been selected
      if (!currentOrganization) {
        setLoading(false);
        setUserPermissions([]);
        return;
      }

      setLoading(true);
      setError(undefined);
      try {
        const response = await get<PermissionList>('auth/listpermissions', abortController.signal);
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

    void loadPermissions();

    // Cleanup: abort the request if the organization changes or component unmounts
    return () => {
      abortController.abort();
    };
  }, [get, currentOrganization]);

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
