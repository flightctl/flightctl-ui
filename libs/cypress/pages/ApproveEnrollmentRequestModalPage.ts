export class ApproveEnrollmentRequestModalPage {
  constructor() {
    cy.get('[aria-modal="true"]').as(ApproveEnrollmentRequestModalPage.name);
  }

  static get alias() {
    return `@${ApproveEnrollmentRequestModalPage.name}`;
  }

  get body() {
    return cy.get(ApproveEnrollmentRequestModalPage.alias);
  }

  get modalTitle() {
    return cy.get('h1');
  }

  get addNewLabelButton() {
    return cy.get('button').contains('Add label');
  }

  get newlyAddedLabelButton() {
    return cy.get('button').contains('key=value');
  }

  get newLabelField() {
    return cy.get('#editable-input').should('contain.value', 'key=value');
  }

  get deviceName() {
    return cy.get('[aria-label="Name"]');
  }

  get deviceAliasField() {
    return this.body.get('input[aria-label="Alias"]');
  }

  get approveSubmitButton() {
    return this.body.contains('button', 'Approve');
  }
}
