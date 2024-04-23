export class FleetsPage {
  constructor() {
    cy.get('section').as(FleetsPage.name);
  }

  static get alias() {
    return `@${FleetsPage.name}`;
  }

  static visit() {
    cy.visit(`/devicemanagement/fleets`);
  }

  get body() {
    return cy.get(FleetsPage.alias);
  }

  get title() {
    return cy.get('h1');
  }

  get openCreateFleetFormButton() {
    return cy.contains('button', 'Create');
  }

  fleetRow(fleetName: string) {
    return cy.get('td[data-label="Name"]').contains(fleetName);
  }
}
