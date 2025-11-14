const loadInterceptors = () => {
  cy.intercept('GET', '/api/login/info', (req) => {
    req.reply({
      statusCode: 418,
    });
  });

  cy.intercept('POST', '/api/flightctl/api/v1/auth/checkpermission', (req) => {
    const items = req.body.permissions;
    const response = items.map((item: { resource: string; op: string }) => ({
      resource: item.resource,
      op: item.op,
      allowed: true,
    }));
    req.reply({
      statusCode: 200,
      body: {
        results: response,
      },
    });
  });
};

export { loadInterceptors };
