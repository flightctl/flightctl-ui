export class NewRepositoryFormPage {
  constructor() {
    cy.get('section').as(NewRepositoryFormPage.name);
  }

  static get alias() {
    return `@${NewRepositoryFormPage.name}`;
  }

  get body() {
    return cy.get(NewRepositoryFormPage.alias);
  }

  get title() {
    return cy.get('h1');
  }

  get newRepositoryNameField() {
    return cy.get('input[aria-label="Repository name"]');
  }

  get newRepositoryUrlField() {
    return cy.get('input[aria-label="Repository URL"]');
  }

  get createFleetFormSubmitButton() {
    return cy.contains('button', 'Create repository');
  }
}
