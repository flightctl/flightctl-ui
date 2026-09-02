export class DevicesPage {
  constructor() {
    cy.get('section').as(DevicesPage.name);
  }

  static get alias() {
    return `@${DevicesPage.name}`;
  }

  static visit() {
    cy.visit(`/devicemanagement/devices`);
  }

  get body() {
    return cy.get(DevicesPage.alias);
  }

  get firstEnrollmentRequestKebabMenu() {
    return cy.get(`[data-testid=enrollment-request-0] button[aria-label="Kebab toggle"]`);
  }

  get enrollmentRequestSearchInput() {
    return cy.get('[data-testid="pending-enrollment-request-search-input"]');
  }

  get pendingEnrollmentRequestsSection() {
    return cy.get('[data-testid="pending-enrollment-requests-section"]');
  }

  get pendingEnrollmentRequestsLoading() {
    return cy.get('[data-testid="pending-enrollment-requests-loading"]');
  }

  get pendingEnrollmentRequestsNoResults() {
    return this.pendingEnrollmentRequestsSection.contains('No results found');
  }

  get firstEnrollmentRequestRow() {
    return cy.get('[data-testid="enrollment-request-0"]');
  }

  enrollmentRequestKebabMenuAction(actionName: string) {
    return cy.get('[role="menuitem"]').contains(actionName);
  }
}
