import * as React from 'react';
import { Organization, OrganizationList } from '@flightctl/types';
import { useAppContext } from '../../hooks/useAppContext';
import { getErrorMessage } from '../../utils/error';
import { getCurrentOrganizationId, storeCurrentOrganizationId } from '../../utils/organizationStorage';

interface OrganizationContextType {
  currentOrganization?: Organization;
  availableOrganizations: Organization[];
  isOrganizationSelectionRequired: boolean;
  selectOrganization: (org: Organization) => void;
  selectionError?: string;
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
  const proxyFetch = fetch.proxyFetch;

  const [isOrganizationsEnabled, setIsOrganizationsEnabled] = React.useState<boolean | null>(null); // null = loading
  const [currentOrganization, setCurrentOrganization] = React.useState<Organization | undefined>();
  const [availableOrganizations, setAvailableOrganizations] = React.useState<Organization[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = React.useState(false);
  const [selectionError, setSelectionError] = React.useState<string | undefined>();

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

  // Determine if multi-orgs are enabled. If so, check if an organization is already selected
  React.useEffect(() => {
    const initializeOrganizations = async () => {
      try {
        // First, check if organizations are enabled via proxy endpoint
        const organizationsEnabledResponse = await proxyFetch('organizations-enabled', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });

        const organizationsEnabled = organizationsEnabledResponse.status !== 501;
        setIsOrganizationsEnabled(organizationsEnabled);

        if (!organizationsEnabled) {
          return;
        }

        // Organizations are enabled - load available organizations
        const organizations = await fetch.get<OrganizationList>('organizations');
        setAvailableOrganizations(organizations.items);

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
      } catch (error) {
        setSelectionError(getErrorMessage(error));
        setIsOrganizationsEnabled(false);
        setAvailableOrganizations([]);
      } finally {
        setOrganizationsLoaded(true);
      }
    };

    void initializeOrganizations();
  }, [fetch, proxyFetch, selectOrganization]);

  const isOrganizationSelectionRequired = React.useMemo(() => {
    // Don't show selector while still loading
    if (isOrganizationsEnabled === null || !organizationsLoaded) {
      return false;
    }

    return isOrganizationsEnabled && availableOrganizations.length > 1 && !currentOrganization;
  }, [isOrganizationsEnabled, organizationsLoaded, availableOrganizations.length, currentOrganization]);

  const contextValue = React.useMemo(
    () => ({
      currentOrganization,
      availableOrganizations,
      isOrganizationSelectionRequired,
      selectOrganization,
      selectionError,
    }),
    [currentOrganization, availableOrganizations, isOrganizationSelectionRequired, selectOrganization, selectionError],
  );

  return <OrganizationContext.Provider value={contextValue}>{children}</OrganizationContext.Provider>;
};

export default OrganizationGuard;
