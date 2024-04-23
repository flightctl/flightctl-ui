export class NewFleetFormPage {
  constructor() {
    cy.get('section').as(NewFleetFormPage.name);
  }

  static get alias() {
    return `@${NewFleetFormPage.name}`;
  }

  get body() {
    return cy.get(NewFleetFormPage.alias);
  }

  get title() {
    return cy.get('h1');
  }

  get newFleetNameField() {
    return cy.get('input[aria-label="Name"]');
  }

  get newFleetNameErrorMessage() {
    return cy.get('#form-control__textfield-name .pf-v5-c-helper-text__item.pf-m-error');
  }

  get newFleetOSImageField() {
    return cy.get('input[aria-label="OS image"]');
  }

  get newFleetSourceNameField() {
    return cy.get('input[aria-label="Source name"]');
  }

  get newFleetRepositoryUrlField() {
    return cy.get('input[aria-label="Repository URL"]');
  }

  get newFleetTargetReferenceField() {
    return cy.get('input[aria-label="Repository target reference"]');
  }

  get newFleetRepositoryPathField() {
    return cy.get('input[aria-label="Repository path"]');
  }

  get createFleetFormSubmitButton() {
    return cy.contains('button', 'Create fleet');
  }
}
