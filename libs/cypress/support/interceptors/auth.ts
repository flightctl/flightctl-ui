const loadInterceptors = () => {
  cy.intercept('GET', '/api/login/info', (req) => {
    req.reply({
      statusCode: 418,
    });
  });

  cy.intercept('GET', '/api/flightctl/api/v1/auth/listpermissions', (req) => {
    // Return a mock PermissionList with common permissions
    req.reply({
      statusCode: 200,
      body: {
        permissions: [
          {
            resource: '*',
            operations: ['*'],
          },
        ],
      },
    });
  });
};

export { loadInterceptors };
