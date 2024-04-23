import { erList } from '../../fixtures';
import { EnrollmentRequest } from '@flightctl/types';

const buildErResponse = (enrollmentRequests: EnrollmentRequest[]) => ({
  apiVersion: 'v1alpha1',
  items: enrollmentRequests,
  kind: 'EnrollmentRequestList',
  metadata: {},
});

const loadInterceptors = () => {
  cy.intercept('GET', '/api/flightctl/api/v1/enrollmentrequests', (req) => {
    req.reply({
      body: buildErResponse(erList),
    });
  }).as('enrollment-requests');

  cy.intercept('POST', '/api/flightctl/api/v1/enrollmentrequests/*/approval', (req) => {
    // Approving an ER converts it into a device, we're skipping mocking it for now.
    // We can just signal that the request was successful
    req.reply({ statusCode: 200, body: {} });
  }).as('approve-enrollment-request');
};

export { loadInterceptors };
