export class GenericModalPage {
  constructor() {
    cy.get('[aria-modal="true"]').as(GenericModalPage.name);
  }

  static get alias() {
    return `@${GenericModalPage.name}`;
  }

  get body() {
    return cy.get(GenericModalPage.alias);
  }

  get modalTitle() {
    return cy.get('h1');
  }
}
