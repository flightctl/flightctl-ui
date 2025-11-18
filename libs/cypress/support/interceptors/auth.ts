import { defaultOrg } from '../../fixtures/auth/organization';

const loadInterceptors = () => {
  cy.intercept('GET', '/api/login/info', (req) => {
    req.reply({
      statusCode: 418,
    });
  });

  cy.intercept('GET', '/api/organizations-enabled', (req) => {
    req.reply({
      statusCode: 200, // marks organizations as enabled
    });
  });

  // Returning a single organization makes it become selected automatically
  cy.intercept('GET', '/api/flightctl/api/v1/organizations', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        apiVersion: 'v1alpha1',
        kind: 'OrganizationList',
        metadata: {},
        items: [defaultOrg],
      },
    });
  });

  cy.intercept('GET', '/api/flightctl/api/v1/auth/permissions', (req) => {
    // The user is a super admin
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
