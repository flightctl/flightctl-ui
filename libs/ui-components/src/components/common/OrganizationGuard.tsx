import * as React from 'react';
import { Organization, OrganizationList } from '@flightctl/types';
import { useAppContext } from '../../hooks/useAppContext';
import { getErrorMessage } from '../../utils/error';

interface OrganizationContextType {
  currentOrganization?: Organization;
  availableOrganizations: Organization[];
  isOrganizationSelectionRequired: boolean;
  selectOrganization: (org: Organization) => Promise<void>;
  selectionError?: string;
}

const OrganizationContext = React.createContext<OrganizationContextType | null>(null);
export const ORGANIZATION_LOCAL_STORAGE_KEY = 'flightctl-current-organization';

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

  const selectOrganization = React.useCallback(
    async (org: Organization) => {
      const organizationId = org.metadata?.name || '';

      try {
        // Send organization selection to UI proxy
        await proxyFetch('current-organization', { method: 'POST', body: JSON.stringify({ organizationId }) });
        // Set in localStorage for OrganizationSelector pre-selection in the next login
        localStorage.setItem(ORGANIZATION_LOCAL_STORAGE_KEY, organizationId);

        setCurrentOrganization(org);
      } catch (error) {
        // The selection must be made at the proxy level, or all requests will fail with the missing org_id
        setSelectionError(getErrorMessage(error));
      }
    },
    [proxyFetch],
  );

  // Determine if multi-orgs are enabled. If so, check if an organization is already selected
  React.useEffect(() => {
    const initializeOrganizations = async () => {
      try {
        const currentOrgResponse = await proxyFetch('current-organization', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const organizationsEnabled = currentOrgResponse.status !== 501;
        setIsOrganizationsEnabled(organizationsEnabled);

        if (!organizationsEnabled) {
          return;
        }

        // Load available organizations
        const organizations = await fetch.get<OrganizationList>('organizations');
        setAvailableOrganizations(organizations.items);

        let cookieOrganization: string | null = null;
        if (currentOrgResponse.ok) {
          const data = (await currentOrgResponse.json()) as { organizationId: string };
          cookieOrganization = data.organizationId;
        }

        if (cookieOrganization) {
          // The user already selected an organization in this login session, update state
          const currentOrg = organizations.items.find((org) => org.metadata?.name === cookieOrganization);
          if (currentOrg) {
            setCurrentOrganization(currentOrg);
          }
        } else if (organizations.items?.length === 1) {
          // The user did not select an organization in this login session, but they only have access to one.
          await selectOrganization(organizations.items[0]);
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
