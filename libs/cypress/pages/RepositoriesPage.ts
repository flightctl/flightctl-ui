export class RepositoriesPage {
  constructor() {
    cy.get('section').as(RepositoriesPage.name);
  }

  static get alias() {
    return `@${RepositoriesPage.name}`;
  }

  static visit() {
    cy.visit(`/devicemanagement/repositories`);
  }

  get body() {
    return cy.get(RepositoriesPage.alias);
  }

  get title() {
    return cy.get('h1');
  }

  get openCreateRepositoryFormButton() {
    return cy.contains('button', 'Create repository');
  }

  repositoryRow(repositoryName: string) {
    return cy.get('td[data-label="Name"]').contains(repositoryName);
  }
}
