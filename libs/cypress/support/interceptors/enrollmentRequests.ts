import { getErList } from '../../fixtures';
import { EnrollmentRequest } from '@flightctl/types';
import { API_VERSION } from '../constants';
import { createListMatcher } from './matchers';

const buildErResponse = (enrollmentRequests: EnrollmentRequest[]) => ({
  apiVersion: API_VERSION,
  items: enrollmentRequests,
  kind: 'EnrollmentRequestList',
  metadata: {},
});

const loadInterceptors = () => {
  cy.intercept('GET', createListMatcher('enrollmentrequests'), (req) => {
    const hasFieldSelector = req.url.includes('fieldSelector=');
    req.reply({
      body: buildErResponse(getErList(hasFieldSelector)),
    });
  }).as('all-enrollment-requests');

  cy.intercept('PUT', '/api/flightctl/api/v1/enrollmentrequests/*/approval', (req) => {
    // Approving an ER converts it into a device, we're skipping mocking it for now.
    // We can just signal that the request was successful
    req.reply({ statusCode: 200, body: {} });
  }).as('approve-enrollment-request');
};

export { loadInterceptors };
