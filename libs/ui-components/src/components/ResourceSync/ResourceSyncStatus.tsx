import * as React from 'react';
import { Label, LabelProps, Popover, Stack, StackItem } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { ConditionType, ResourceSync } from '@flightctl/types';
import WithTooltip from '../common/WithTooltip';
import { getRepositorySyncStatus, repositoryStatusLabels } from '../../utils/status/repository';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { Trans } from 'react-i18next';

type ResourceSyncStatusProps = {
  resourceSync: ResourceSync;
  showLinksOnError?: boolean;
};

const ResourceSyncStatus = ({ resourceSync, showLinksOnError = false }: ResourceSyncStatusProps) => {
  const { t } = useTranslation();
  const statusType = getRepositorySyncStatus(resourceSync, t);
  const statusLabels = repositoryStatusLabels(t);

  let color: LabelProps['color'];
  let icon: React.ReactNode;

  switch (statusType.status) {
    case ConditionType.ResourceSyncResourceParsed:
    case 'Sync pending':
      color = 'orange';
      icon = <InProgressIcon />;
      break;
    case ConditionType.ResourceSyncSynced:
    case ConditionType.RepositoryAccessible:
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    case 'Not parsed':
    case 'Not synced':
    case 'Not accessible':
      color = 'red';
      icon = <ExclamationCircleIcon />;
      break;
    default:
      color = 'grey';
      icon = <OutlinedQuestionCircleIcon />;
      break;
  }

  if (color === 'red' && showLinksOnError) {
    const repositoryName = resourceSync.spec.repository;
    const rsName = resourceSync.metadata.name;
    return (
      <Popover
        triggerAction="hover"
        aria-label={t('Invalid resource sync configuration')}
        headerContent={t('Invalid resource sync configuration')}
        bodyContent={
          <Stack hasGutter>
            <StackItem>
              <Trans t={t}>
                An error occurred when trying to apply the resource sync <strong>{rsName}</strong> from repository{' '}
                <strong>{repositoryName}</strong>:
              </Trans>
            </StackItem>
            <StackItem>{statusType.message}</StackItem>
            <StackItem>
              <Link to={{ route: ROUTE.RESOURCE_SYNC_DETAILS, postfix: resourceSync.metadata.name }}>
                Review and fix the configuration
              </Link>
            </StackItem>
          </Stack>
        }
      >
        <Label color={color} icon={icon}>
          {statusLabels[statusType.status]}
        </Label>
      </Popover>
    );
  }

  return (
    <WithTooltip showTooltip={!!statusType.message} content={statusType.message}>
      <Label color={color} icon={icon}>
        {statusLabels[statusType.status]}
      </Label>
    </WithTooltip>
  );
};

export default ResourceSyncStatus;
