const mainPages = ['Devices', 'Fleets', 'Repositories'];

describe('App navigation', () => {
  beforeEach(() => {
    cy.loadApiInterceptors();
  });

  it('opens the Fleets page when accessing the root page', () => {
    cy.visit('/');

    cy.get('h1').should('have.text', 'Fleets');
  });

  mainPages.forEach((page) => {
    it(`opens the ${page} page when clicking on its menu entry`, () => {
      cy.visit('/');

      cy.get('button[aria-label="Global navigation"]').click();
      cy.get('nav').contains(page).click();

      cy.get('h1').should('have.text', page);
    });
  });
});
