export class CatalogPage {
  constructor() {
    cy.get('section').as(CatalogPage.name);
  }

  static get alias() {
    return `@${CatalogPage.name}`;
  }

  static visit() {
    cy.visit('/catalog');
  }

  get body() {
    return cy.get(CatalogPage.alias);
  }

  selectCatalog(displayName: string) {
    this.body.find('[data-testid="catalog-filter-tree"]').find('[role="treeitem"]').contains(displayName).click();
  }
}
