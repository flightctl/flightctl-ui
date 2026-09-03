import { getErList } from '../../fixtures';
import type { EnrollmentRequest, EnrollmentRequestList } from '@flightctl/types';
import { API_VERSION } from '../constants';
import { createListMatcher } from './matchers';

const UNFILTERED_RESPONSE_DELAY_MS = 1000;

const buildErResponse = (enrollmentRequests: EnrollmentRequest[]): EnrollmentRequestList => ({
  apiVersion: API_VERSION,
  items: enrollmentRequests,
  kind: 'EnrollmentRequestList',
  metadata: {},
});

let shouldDelayNextUnfilteredPendingEnrollmentResponse = false;

const loadInterceptors = () => {
  cy.intercept('GET', createListMatcher('enrollmentrequests'), (req) => {
    const requestUrl = new URL(req.url);
    const fieldSelector = requestUrl.searchParams.get('fieldSelector') || '';
    const hasFieldSelector = !!fieldSelector;
    const enrollmentRequests = filterEnrollmentRequests(getErList(hasFieldSelector), fieldSelector);
    const body = buildErResponse(enrollmentRequests);

    if (
      shouldDelayNextUnfilteredPendingEnrollmentResponse &&
      isUnfilteredPendingEnrollmentRequest(requestUrl, fieldSelector)
    ) {
      shouldDelayNextUnfilteredPendingEnrollmentResponse = false;
      req.reply({
        body,
        delayMs: UNFILTERED_RESPONSE_DELAY_MS,
      });
      return;
    }

    if (getNameSearch(fieldSelector) && enrollmentRequests.length === 0) {
      shouldDelayNextUnfilteredPendingEnrollmentResponse = true;
    }

    req.reply({ body });
  }).as('all-enrollment-requests');

  cy.intercept('PUT', '/api/flightctl/api/v1/enrollmentrequests/*/approval', (req) => {
    // Approving an ER converts it into a device, we're skipping mocking it for now.
    // We can just signal that the request was successful
    req.reply({ statusCode: 200, body: {} });
  }).as('approve-enrollment-request');
};

const filterEnrollmentRequests = (
  enrollmentRequests: EnrollmentRequest[],
  fieldSelector: string,
): EnrollmentRequest[] => {
  const nameSearch = getNameSearch(fieldSelector);
  if (!nameSearch) {
    return enrollmentRequests;
  }
  return enrollmentRequests.filter((er) => er.metadata.name?.includes(nameSearch));
};

const getNameSearch = (fieldSelector: string): string | undefined => {
  for (const selector of fieldSelector.split(',')) {
    const match = selector.match(/^metadata\.name contains ([^,]+)$/);
    if (match) {
      return match[1];
    }
  }
  return undefined;
};

const isUnfilteredPendingEnrollmentRequest = (requestUrl: URL, fieldSelector: string): boolean => {
  return fieldSelector === '!status.approval.approved' && requestUrl.searchParams.get('limit') === '15';
};

export { loadInterceptors };
