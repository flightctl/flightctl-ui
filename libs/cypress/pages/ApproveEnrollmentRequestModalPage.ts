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

  get fingerprintName() {
    return cy.get('[aria-label="Fingerprint"]');
  }

  get displayNameField() {
    return cy.get('input[aria-label="Display name"]');
  }

  get approveSubmitButton() {
    return cy.contains('button', 'Approve');
  }
}
