import * as React from 'react';
import { Organization, OrganizationList } from '@flightctl/types';
import { useAppContext } from '../../hooks/useAppContext';
import { getErrorMessage } from '../../utils/error';
import { getCurrentOrganizationId, storeCurrentOrganizationId } from '../../utils/organizationStorage';
import { showSpinnerBriefly } from '../../utils/time';

export type OrganizationItem = {
  id: string;
  label?: string;
  description?: string;
};

// Returns the list of UserOrganizations ready to be displayed.
// Whenever two organizations have the same displayName, the description is set to the id.
const toOrganizationItems = (apiOrgs: Organization[]): OrganizationItem[] => {
  const displayNameCounts = new Map<string, number>();
  for (const org of apiOrgs) {
    const displayName = org.spec?.displayName;
    if (displayName) {
      const prevCount = displayNameCounts.get(displayName) ?? 0;
      displayNameCounts.set(displayName, prevCount + 1);
    }
  }
  return apiOrgs.map((org) => {
    const id = org.metadata?.name as string;
    const displayName = org.spec?.displayName;
    const sameNameCount = displayNameCounts.get(displayName || '') ?? 0;
    if (sameNameCount > 1) {
      return {
        id,
        label: displayName,
        description: id,
      };
    }
    return {
      id,
      label: displayName,
    };
  });
};

interface OrganizationContextType {
  currentOrganization?: OrganizationItem;
  availableOrganizations: OrganizationItem[];
  mustShowOrganizationSelector: boolean;
  selectOrganization: (org: OrganizationItem) => void;
  selectionError?: string;
  isReloading: boolean;
  isEmptyOrganizations: boolean;
  refetch: (extraDelay: number) => Promise<void>;
}

const OrganizationContext = React.createContext<OrganizationContextType | null>(null);

export const useOrganizationGuardContext = (): OrganizationContextType => {
  const context = React.useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationGuardContext must be used within OrganizationGuard');
  }
  return context;
};

const OrganizationGuard = ({ children }: React.PropsWithChildren) => {
  const { fetch } = useAppContext();

  const [currentOrganization, setCurrentOrganization] = React.useState<OrganizationItem | undefined>();
  const [availableOrganizations, setAvailableOrganizations] = React.useState<OrganizationItem[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = React.useState(false);
  const [selectionError, setSelectionError] = React.useState<string | undefined>();
  const [isEmptyOrganizations, setIsEmptyOrganizations] = React.useState(false);
  const [isReloading, setIsReloading] = React.useState(false);
  const initializationStartedRef = React.useRef(false);

  const selectOrganization = React.useCallback((org: OrganizationItem) => {
    try {
      storeCurrentOrganizationId(org.id);
      setCurrentOrganization(org);
    } catch (error) {
      setSelectionError(getErrorMessage(error));
    }
  }, []);

  const fetchOrganizations = React.useCallback(async () => {
    try {
      const organizations = await fetch.get<OrganizationList>('organizations');
      const orgItems = toOrganizationItems(organizations.items ?? []);
      setAvailableOrganizations(orgItems);

      // Treat empty organizations list as an error
      if (!orgItems.length) {
        setSelectionError('No organizations available');
        setIsEmptyOrganizations(true);
        setOrganizationsLoaded(true);
        return;
      }

      const currentOrgId = getCurrentOrganizationId();

      // Validate current organization against available organizations
      const currentOrg = currentOrgId ? orgItems.find((org) => org.id === currentOrgId) : undefined;

      if (currentOrg) {
        // The previously selected organization exists - use it
        selectOrganization(currentOrg);
      } else {
        if (orgItems.length === 1) {
          // Only one organization available - select it automatically
          selectOrganization(orgItems[0]);
        } else if (currentOrgId) {
          // Previously set organization does not exist anymore - remove it from localStorage so the user can select a new organization
          setCurrentOrganization(undefined);
          storeCurrentOrganizationId('');
        }
      }
      setSelectionError(undefined);
      setIsEmptyOrganizations(false);
    } catch (error) {
      setSelectionError(getErrorMessage(error));
      setAvailableOrganizations([]);
      setIsEmptyOrganizations(false);
    } finally {
      setOrganizationsLoaded(true);
    }
  }, [fetch, selectOrganization]);

  const refetch = React.useCallback(
    async (addDelay: number = 0) => {
      setIsReloading(true);
      try {
        await showSpinnerBriefly(addDelay);
        await fetchOrganizations();
      } finally {
        setIsReloading(false);
      }
    },
    [fetchOrganizations],
  );

  // Determine if multi-orgs are enabled. If so, check if an organization is already selected
  React.useEffect(() => {
    // Prevent multiple initialization calls - only run once
    if (initializationStartedRef.current) {
      return;
    }

    initializationStartedRef.current = true;

    void fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mustShowOrganizationSelector = React.useMemo(() => {
    // Don't show selector while still loading
    if (!organizationsLoaded) {
      return false;
    }
    // Show selector if there's an error OR if multiple orgs and none selected
    return !!selectionError || (availableOrganizations.length > 1 && !currentOrganization);
  }, [organizationsLoaded, selectionError, availableOrganizations.length, currentOrganization]);

  const contextValue = React.useMemo(
    () => ({
      currentOrganization,
      availableOrganizations,
      mustShowOrganizationSelector,
      selectOrganization,
      selectionError,
      isEmptyOrganizations,
      isReloading,
      refetch,
    }),
    [
      currentOrganization,
      availableOrganizations,
      mustShowOrganizationSelector,
      selectOrganization,
      selectionError,
      isEmptyOrganizations,
      isReloading,
      refetch,
    ],
  );

  return <OrganizationContext.Provider value={contextValue}>{children}</OrganizationContext.Provider>;
};

export default OrganizationGuard;
