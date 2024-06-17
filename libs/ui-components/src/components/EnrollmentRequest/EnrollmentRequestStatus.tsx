import * as React from 'react';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';

import { EnrollmentRequest } from '@flightctl/types';
import { ApprovalStatus, approvalStatusLabels, getApprovalStatus } from '../../utils/status/enrollmentRequest';
import { useTranslation } from '../../hooks/useTranslation';
import StatusLabel, { StatusLabelColor } from '../common/StatusLabel';

const EnrollmentRequestStatus = ({ er }: { er?: EnrollmentRequest }) => {
  const { t } = useTranslation();
  const status = er ? getApprovalStatus(er) : ApprovalStatus.Unknown;
  const statusLabels = approvalStatusLabels(t);

  let colorStatus: StatusLabelColor;
  let icon: React.ReactNode;

  switch (status) {
    case ApprovalStatus.Pending:
      icon = <PauseCircleIcon />;
      colorStatus = 'info';
      break;
    case ApprovalStatus.Approved:
      colorStatus = 'success';
      icon = <CheckCircleIcon />;
      break;
    case ApprovalStatus.Denied:
      colorStatus = 'danger';
      icon = <ExclamationCircleIcon />;
      break;
    case ApprovalStatus.Unknown:
      colorStatus = 'unknown';
      icon = <QuestionCircleIcon />;
      break;
  }

  return <StatusLabel label={statusLabels[status]} status={colorStatus} icon={icon} />;
};

export default EnrollmentRequestStatus;
