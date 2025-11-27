const loadInterceptors = () => {
  cy.intercept('GET', /^\/api\/alerts\/api\/v2\/alerts(\?.*)?$/, (req) => {
    req.reply({
      statusCode: 501, // Makes alerts disabled in the UI
      body: {
        data: [],
      },
    });
  });
};

export { loadInterceptors };
