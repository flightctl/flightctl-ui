/**
 * Simple organization storage utilities with backend validation
 */

const ORGANIZATION_STORAGE_KEY = 'flightctl-current-organization';

// Get current organization ID from localStorage
export const getCurrentOrganizationId = (): string | null => {
  return localStorage.getItem(ORGANIZATION_STORAGE_KEY);
};

// Store organization ID in localStorage
export const storeCurrentOrganizationId = (orgId: string): void => {
  if (orgId) {
    localStorage.setItem(ORGANIZATION_STORAGE_KEY, orgId);
  } else {
    localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
  }
};

// Clear organization data (for logout)
export const clearCurrentOrganization = (): void => {
  localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
};
