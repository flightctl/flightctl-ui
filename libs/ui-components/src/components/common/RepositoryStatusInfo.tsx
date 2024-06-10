import * as React from 'react';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { ConditionType } from '@flightctl/types';
import { RepositorySyncStatus, repositoryStatusLabels } from '../../utils/status/repository';
import { useTranslation } from '../../hooks/useTranslation';
import StatusLabel, { StatusLabelColor } from './StatusLabel';

const RepositoryStatusInfo = ({ statusInfo }: { statusInfo: { status: RepositorySyncStatus; message?: string } }) => {
  const statusType = statusInfo.status;
  const { t } = useTranslation();

  const statusLabels = repositoryStatusLabels(t);

  let icon: React.ReactNode;
  let status: StatusLabelColor;

  switch (statusType) {
    case ConditionType.ResourceSyncSynced:
    case ConditionType.RepositoryAccessible:
      status = 'success';
      icon = <CheckCircleIcon />;
      break;
    case 'Sync pending':
      status = 'warning';
      icon = <InProgressIcon />;
      break;
    case 'Not synced':
    case 'Not parsed':
    case 'Not accessible':
      status = 'danger';
      icon = <ExclamationCircleIcon />;
      break;

    default:
      status = 'unknown';
      icon = <QuestionCircleIcon />;
      break;
  }

  return <StatusLabel label={statusLabels[statusType]} status={status} icon={icon} tooltip={statusInfo.message} />;
};

export default RepositoryStatusInfo;
