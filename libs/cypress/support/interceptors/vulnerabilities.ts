import {
  mockVulnerabilityImpactByCve,
  mockVulnerabilitySummary,
  paginateMockVulnerabilityList,
} from '../../fixtures/vulnerabilities';

const API_BASE_PATH = '/api/flightctl/api/v1';

const vulnerabilityListMatcher = new RegExp(`^${API_BASE_PATH}/vulnerabilities(\\?.*)?$`);
const vulnerabilitySummaryMatcher = new RegExp(`^${API_BASE_PATH}/vulnerabilities/summary(\\?.*)?$`);
const deviceVulnerabilitiesMatcher = new RegExp(`^${API_BASE_PATH}/vulnerabilities/devices/([^/?]+)(\\?.*)?$`);
const fleetVulnerabilitiesMatcher = new RegExp(`^${API_BASE_PATH}/vulnerabilities/fleets/([^/?]+)(\\?.*)?$`);
const vulnerabilityImpactMatcher = new RegExp(`^${API_BASE_PATH}/vulnerabilities/cves/([^/?]+)/impact(\\?.*)?$`);

const extractCveId = (url: string): string | undefined => {
  const match = url.match(/\/vulnerabilities\/cves\/([^/?]+)\/impact/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
};

const loadInterceptors = () => {
  cy.intercept('GET', vulnerabilitySummaryMatcher, {
    body: mockVulnerabilitySummary,
  }).as('vulnerability-summary');

  cy.intercept('GET', vulnerabilityListMatcher, (req) => {
    req.reply({
      body: paginateMockVulnerabilityList(req.url),
    });
  }).as('vulnerabilities');

  cy.intercept('GET', deviceVulnerabilitiesMatcher, (req) => {
    req.reply({
      body: paginateMockVulnerabilityList(req.url),
    });
  }).as('device-vulnerabilities');

  cy.intercept('GET', fleetVulnerabilitiesMatcher, (req) => {
    req.reply({
      body: paginateMockVulnerabilityList(req.url),
    });
  }).as('fleet-vulnerabilities');

  cy.intercept('GET', vulnerabilityImpactMatcher, (req) => {
    const cveId = extractCveId(req.url);
    const impact = cveId ? mockVulnerabilityImpactByCve[cveId] : undefined;

    if (impact) {
      req.reply({ body: impact });
      return;
    }

    req.reply({ statusCode: 404 });
  }).as('vulnerability-impact');
};

export { loadInterceptors };
