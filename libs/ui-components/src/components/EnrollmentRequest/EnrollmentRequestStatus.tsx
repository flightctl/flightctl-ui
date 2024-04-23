import * as React from 'react';
import { Label, LabelProps } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { EnrollmentRequest } from '@flightctl/types';
import { ApprovalStatus, getApprovalStatus } from '../../utils/status/enrollmentRequest';

const EnrollmentRequestStatus = ({ er }: { er?: EnrollmentRequest }) => {
  const status = er ? getApprovalStatus(er) : ApprovalStatus.Unknown;
  let color: LabelProps['color'];
  let icon: LabelProps['icon'];

  switch (status) {
    case ApprovalStatus.Pending:
      icon = <InProgressIcon />;
      color = 'blue';
      break;
    case ApprovalStatus.Approved:
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    case ApprovalStatus.Denied:
      color = 'red';
      icon = <ExclamationCircleIcon />;
      break;
    case ApprovalStatus.Unknown:
      color = 'grey';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <Label color={color} icon={icon}>
      {status}
    </Label>
  );
};

export default EnrollmentRequestStatus;
