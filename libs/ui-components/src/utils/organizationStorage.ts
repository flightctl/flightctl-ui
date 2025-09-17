export const ORGANIZATION_STORAGE_KEY = 'flightctl-current-organization';

export const getCurrentOrganizationId = (): string | null => {
  return localStorage.getItem(ORGANIZATION_STORAGE_KEY);
};

export const storeCurrentOrganizationId = (orgId: string): void => {
  if (orgId) {
    localStorage.setItem(ORGANIZATION_STORAGE_KEY, orgId);
  } else {
    localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
  }
};
