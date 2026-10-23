import * as React from 'react';
import type { TFunction } from 'react-i18next';

import type { Condition, EnrollmentRequest } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import {
  EnrollmentRequestTpmVerificationStatus,
  getTpmVerificationStatus,
  getTpmVerificationStatusItems,
  getTpmVerifiedCondition,
} from '../../utils/status/enrollmentRequest';
import StatusDisplay from './StatusDisplay';

const withMessage = (text: string, extraMessage?: string) => (extraMessage ? `${text} ${extraMessage}` : text);

const getConditionMessage = (t: TFunction, condition?: Condition) => {
  const status = getTpmVerificationStatus(condition);
  switch (status) {
    case EnrollmentRequestTpmVerificationStatus.Verified:
      return withMessage(t('TPM identity verified.'), condition?.message);
    case EnrollmentRequestTpmVerificationStatus.Pending:
      return withMessage(t('TPM identity verification is pending.'), condition?.message);
    case EnrollmentRequestTpmVerificationStatus.Failed:
      return withMessage(t("TPM identity verification couldn't be completed."), condition?.message);
    case EnrollmentRequestTpmVerificationStatus.NotAvailable:
      return withMessage(t("This enrollment request doesn't use a TPM-backed identity."), condition?.message);
    default:
      return withMessage(t('TPM verification status is unknown.'), condition?.message);
  }
};

const EnrollmentRequestTpmStatus = ({ er }: { er?: EnrollmentRequest }) => {
  const { t } = useTranslation();

  const tpmCondition = getTpmVerifiedCondition(er);
  const tpmStatus = getTpmVerificationStatus(tpmCondition);

  const statusItems = getTpmVerificationStatusItems(t);
  const item = statusItems.find((statusItem) => statusItem.id === tpmStatus);

  const message = getConditionMessage(t, tpmCondition);
  return <StatusDisplay item={item} message={message} />;
};

export default EnrollmentRequestTpmStatus;
