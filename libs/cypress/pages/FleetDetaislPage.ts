export class FleetDetailsPage {
  constructor() {
    cy.get('section').as(FleetDetailsPage.name);
  }

  static get alias() {
    return `@${FleetDetailsPage.name}`;
  }

  get body() {
    return cy.get(FleetDetailsPage.alias);
  }

  get title() {
    return cy.get('h1');
  }
}
