import { CatalogPage } from '../../pages/CatalogPage';

describe('Software Catalog empty states', () => {
  let catalogPage: CatalogPage;

  beforeEach(() => {
    cy.loadApiInterceptors();
  });

  beforeEach(() => {
    CatalogPage.visit();
    catalogPage = new CatalogPage();
  });

  it('shows the empty-catalog message when no filters are selected', () => {
    catalogPage.body.contains('h4', 'No catalog items yet').should('be.visible');
  });

  it('shows the filtered-results message when a Catalog filter has no matches', () => {
    catalogPage.selectCatalog('Empty catalog');

    cy.wait('@catalog-items-filtered');
    catalogPage.body.contains('h4', 'No results found').should('be.visible');
    catalogPage.body.contains('h4', 'No catalog items yet').should('not.exist');
  });
});
