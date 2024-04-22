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

  enrollmentRequestKebabMenuAction(actionName: string) {
    return cy.get('[role="menuitem"]').contains(actionName);
  }
}
