import { defaultOrg } from '../../fixtures/auth/organization';
import { API_VERSION } from '../constants';
import { createListMatcher } from './matchers';

const loadInterceptors = () => {
  cy.intercept('GET', '/api/login/info', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        username: 'cypress-user',
      },
    });
  });

  // Returning a single organization makes it become selected automatically
  cy.intercept('GET', createListMatcher('organizations'), (req) => {
    req.reply({
      statusCode: 200,
      body: {
        apiVersion: API_VERSION,
        kind: 'OrganizationList',
        metadata: {},
        items: [defaultOrg],
      },
    });
  });

  cy.intercept('GET', /^\/api\/flightctl\/api\/v1\/auth\/permissions(\?.*)?$/, (req) => {
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
