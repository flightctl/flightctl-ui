import { describe, expect, it } from 'vitest';
import { type Condition, ConditionStatus, ConditionType } from '@flightctl/types';

import { EnrollmentRequestTpmVerificationStatus, getTpmVerificationStatus } from './enrollmentRequest';

const buildTpmCondition = (status: ConditionStatus, reason: string, message = 'TPM condition message'): Condition => ({
  type: ConditionType.EnrollmentRequestTPMVerified,
  status,
  reason,
  message,
  lastTransitionTime: '2026-10-21T00:00:00Z',
});

describe('getEnrollmentRequestTpmVerificationStatus', () => {
  it.each([
    {
      name: 'When there is no TPMVerified condition it should return NotAvailable',
      condition: undefined,
      expected: EnrollmentRequestTpmVerificationStatus.NotAvailable,
    },
    {
      name: 'When TPMVerified is True it should return Verified',
      condition: buildTpmCondition(ConditionStatus.ConditionStatusTrue, 'TPMChallengeSucceeded'),
      expected: EnrollmentRequestTpmVerificationStatus.Verified,
    },
    {
      name: 'When TPMChallengeRequired it should return Pending',
      condition: buildTpmCondition(ConditionStatus.ConditionStatusFalse, 'TPMChallengeRequired'),
      expected: EnrollmentRequestTpmVerificationStatus.Pending,
    },
    {
      name: 'When TPMVerificationFailed it should return Failed',
      condition: buildTpmCondition(ConditionStatus.ConditionStatusFalse, 'TPMVerificationFailed'),
      expected: EnrollmentRequestTpmVerificationStatus.Failed,
    },
    {
      name: 'When TPMChallengeFailed it should return Failed',
      condition: buildTpmCondition(ConditionStatus.ConditionStatusFalse, 'TPMChallengeFailed'),
      expected: EnrollmentRequestTpmVerificationStatus.Failed,
    },
  ])('$name', ({ condition, expected }) => {
    expect(getTpmVerificationStatus(condition)).toBe(expected);
  });
});
