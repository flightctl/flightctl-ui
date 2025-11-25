import { getErList } from '../../fixtures';
import { EnrollmentRequest } from '@flightctl/types';
import { API_VERSION } from '../constants';

const buildErResponse = (enrollmentRequests: EnrollmentRequest[]) => ({
  apiVersion: API_VERSION,
  items: enrollmentRequests,
  kind: 'EnrollmentRequestList',
  metadata: {},
});

const loadInterceptors = () => {
  cy.intercept('GET', /^\/api\/flightctl\/api\/v1\/enrollmentrequests$/, (req) => {
    req.reply({
      body: buildErResponse(getErList(false)),
    });
  }).as('all-enrollment-requests');

  cy.intercept('GET', '/api/flightctl/api/v1/enrollmentrequests?fieldSelector=*', (req) => {
    req.reply({
      body: buildErResponse(getErList(true)),
    });
  }).as('pending-enrollment-requests');

  cy.intercept('PUT', '/api/flightctl/api/v1/enrollmentrequests/*/approval', (req) => {
    // Approving an ER converts it into a device, we're skipping mocking it for now.
    // We can just signal that the request was successful
    req.reply({ statusCode: 200, body: {} });
  }).as('approve-enrollment-request');
};

export { loadInterceptors };
