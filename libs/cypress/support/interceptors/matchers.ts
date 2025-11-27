/**
 * Utility functions for creating Cypress intercept matchers
 */

const API_BASE_PATH = '/api/flightctl/api/v1';

/**
 * Creates a matcher for list endpoints (e.g., /api/flightctl/api/v1/repositories?limit=15)
 * @param entity - The entity name (e.g., 'repositories', 'fleets', 'devices')
 * @returns A regex pattern that matches the list endpoint with optional query parameters
 */
export const createListMatcher = (entity: string): RegExp => {
  return new RegExp(`^${API_BASE_PATH}/${entity}(\\?.*)?$`);
};

/**
 * Creates a matcher for detail endpoints (e.g., /api/flightctl/api/v1/repositories/my-repo?someParam=value)
 * @param entity - The entity name (e.g., 'repositories', 'fleets', 'devices')
 * @returns A regex pattern that matches the detail endpoint with optional query parameters
 */
export const createDetailMatcher = (entity: string): RegExp => {
  return new RegExp(`^${API_BASE_PATH}/${entity}/([^?]+)(\\?.*)?$`);
};

/**
 * Extracts the resource name from a URL
 * @param url - The full URL
 * @param entity - The entity name to extract from
 * @returns The resource name or undefined if not found
 */
export const extractResourceName = (url: string, entity: string): string | undefined => {
  const match = url.match(new RegExp(`/${entity}/([^?]+)`));
  return match?.[1];
};
