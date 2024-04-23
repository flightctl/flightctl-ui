const loadInterceptors = () => {
  cy.intercept('GET', '/api/flightctl/api/v1/resourcesyncs', (req) => {
    req.reply({
      body: [],
    });
  }).as('resource-syncs');
};

export { loadInterceptors };
