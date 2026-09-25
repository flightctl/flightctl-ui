import { getErList } from '../../fixtures';
import type { EnrollmentRequest, EnrollmentRequestList } from '@flightctl/types';
import { API_VERSION } from '../constants';
import { createListMatcher } from './matchers';

const UNFILTERED_RESPONSE_DELAY_MS = 1000;
const TEST_PAGE_SIZE = 15;
const TEST_PENDING_ENROLLMENT_COUNT = TEST_PAGE_SIZE + 1;
const FIRST_PAGE_CONTINUE_TOKEN = 'page-2';

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
    const enrollmentRequests = filterEnrollmentRequests(getTestEnrollmentRequests(hasFieldSelector), fieldSelector);
    const pageStart = requestUrl.searchParams.get('continue') === FIRST_PAGE_CONTINUE_TOKEN ? TEST_PAGE_SIZE : 0;
    const pageItems = enrollmentRequests.slice(pageStart, pageStart + TEST_PAGE_SIZE);
    const remainingItemCount = Math.max(enrollmentRequests.length - pageStart - pageItems.length, 0);
    const body = buildErResponse(pageItems);
    body.metadata = {
      ...(remainingItemCount > 0 ? { continue: FIRST_PAGE_CONTINUE_TOKEN } : {}),
      remainingItemCount,
    };

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

const getTestEnrollmentRequests = (onlyPending: boolean): EnrollmentRequest[] => {
  const enrollmentRequests = getErList(onlyPending);
  if (!onlyPending || enrollmentRequests.length < 2 || enrollmentRequests.length >= TEST_PENDING_ENROLLMENT_COUNT) {
    return enrollmentRequests;
  }

  const firstPendingEnrollment = enrollmentRequests[0];
  const lastPendingEnrollment = enrollmentRequests[enrollmentRequests.length - 1];
  const fillerEnrollmentCount = TEST_PENDING_ENROLLMENT_COUNT - enrollmentRequests.length;
  const fillerEnrollments = Array.from({ length: fillerEnrollmentCount }, (_, index) => ({
    ...firstPendingEnrollment,
    metadata: {
      ...firstPendingEnrollment.metadata,
      name: `${firstPendingEnrollment.metadata.name || 'pending-enrollment'}-filler-${index}`,
    },
  }));

  return [firstPendingEnrollment, ...fillerEnrollments, lastPendingEnrollment];
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
