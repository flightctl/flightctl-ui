const loadInterceptors = () => {
  cy.intercept('GET', '/api/login/info', (req) => {
    req.reply({
      statusCode: 418,
    });
  });
};

export { loadInterceptors };
