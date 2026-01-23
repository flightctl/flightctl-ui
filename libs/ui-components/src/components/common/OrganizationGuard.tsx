import * as React from 'react';
import { Organization, OrganizationList } from '@flightctl/types';
import { useAppContext } from '../../hooks/useAppContext';
import { getErrorMessage } from '../../utils/error';
import { getCurrentOrganizationId, storeCurrentOrganizationId } from '../../utils/organizationStorage';
import { showSpinnerBriefly } from '../../utils/time';

interface OrganizationContextType {
  currentOrganization?: Organization;
  availableOrganizations: Organization[];
  mustShowOrganizationSelector: boolean;
  selectOrganization: (org: Organization) => void;
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

  const [currentOrganization, setCurrentOrganization] = React.useState<Organization | undefined>();
  const [availableOrganizations, setAvailableOrganizations] = React.useState<Organization[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = React.useState(false);
  const [selectionError, setSelectionError] = React.useState<string | undefined>();
  const [isEmptyOrganizations, setIsEmptyOrganizations] = React.useState(false);
  const [isReloading, setIsReloading] = React.useState(false);
  const initializationStartedRef = React.useRef(false);

  const selectOrganization = React.useCallback((org: Organization) => {
    const organizationId = org.metadata?.name || '';

    try {
      // Store organization in localStorage - headers will handle the rest
      storeCurrentOrganizationId(organizationId);
      setCurrentOrganization(org);
    } catch (error) {
      setSelectionError(getErrorMessage(error));
    }
  }, []);

  const fetchOrganizations = React.useCallback(async () => {
    try {
      const organizations = await fetch.get<OrganizationList>('organizations');
      setAvailableOrganizations(organizations.items);

      // Treat empty organizations list as an error
      if (!organizations.items || organizations.items.length === 0) {
        setSelectionError('No organizations available');
        setIsEmptyOrganizations(true);
        setOrganizationsLoaded(true);
        return;
      }

      const currentOrgId = getCurrentOrganizationId();

      // Validate current organization against available organizations
      const currentOrg = currentOrgId
        ? organizations.items.find((org) => org.metadata?.name === currentOrgId)
        : undefined;

      if (currentOrg) {
        // The previously selected organization exists - use it
        selectOrganization(currentOrg);
      } else {
        if (organizations.items?.length === 1) {
          // Only one organization available - select it automatically
          selectOrganization(organizations.items[0]);
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
