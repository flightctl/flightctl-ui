import * as React from 'react';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { ConditionType } from '@flightctl/types';
import { RepositorySyncStatus, repositoryStatusLabels } from '../../utils/status/repository';
import { StatusLevel } from '../../utils/status/common';
import { useTranslation } from '../../hooks/useTranslation';
import { StatusDisplayContent } from './StatusDisplay';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

const RepositoryStatus = ({ statusInfo }: { statusInfo: { status: RepositorySyncStatus; message?: string } }) => {
  const statusType = statusInfo.status;
  const { t } = useTranslation();

  const statusLabels = repositoryStatusLabels(t);

  let customIcon: React.ComponentClass<SVGIconProps> | undefined;
  let status: StatusLevel;

  switch (statusType) {
    case ConditionType.ResourceSyncSynced:
    case ConditionType.RepositoryAccessible:
      status = 'success';
      break;
    case 'Sync pending':
      status = 'warning';
      customIcon = InProgressIcon;
      break;
    case 'Not synced':
    case 'Not parsed':
    case 'Not accessible':
      status = 'danger';
      break;

    default:
      status = 'unknown';
      break;
  }

  return (
    <StatusDisplayContent
      label={statusLabels[statusType]}
      level={status}
      customIcon={customIcon}
      message={statusInfo.message}
    />
  );
};

export default RepositoryStatus;
