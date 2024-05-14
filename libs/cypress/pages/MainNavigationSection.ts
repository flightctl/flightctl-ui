export class MainNavigationSection {
  constructor() {
  }

  static navigateToFlightCtlSection(section: string) {
    cy.get('button[aria-label="Global navigation"]').click()
    cy.get('nav').contains(section).click();
  }
}
