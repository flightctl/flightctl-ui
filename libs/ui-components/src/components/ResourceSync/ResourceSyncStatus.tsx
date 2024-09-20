import * as React from 'react';
import { Trans } from 'react-i18next';
import { LabelProps, Popover, Stack, StackItem } from '@patternfly/react-core';

import { ConditionType, ResourceSync } from '@flightctl/types';
import { getRepositorySyncStatus, repositoryStatusLabels } from '../../utils/status/repository';
import { StatusLevel } from '../../utils/status/common';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { StatusDisplayContent } from '../Status/StatusDisplay';

type ResourceSyncStatusProps = {
  resourceSync: ResourceSync;
  showLinksOnError?: boolean;
};

const ResourceSyncStatus = ({ resourceSync, showLinksOnError = false }: ResourceSyncStatusProps) => {
  const { t } = useTranslation();
  const statusType = getRepositorySyncStatus(resourceSync, t);
  const statusLabels = repositoryStatusLabels(t);

  let color: LabelProps['color'];
  let status: StatusLevel;

  switch (statusType.status) {
    case ConditionType.ResourceSyncResourceParsed:
    case 'Sync pending':
      status = 'warning';
      break;
    case ConditionType.ResourceSyncSynced:
    case ConditionType.RepositoryAccessible:
      status = 'success';
      break;
    case 'Not parsed':
    case 'Not synced':
    case 'Not accessible':
      status = 'danger';
      break;
    default:
      status = 'unknown';
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
        <StatusDisplayContent label={statusLabels[statusType.status]} level={status} message={statusType.message} />
      </Popover>
    );
  }

  return <StatusDisplayContent label={statusLabels[statusType.status]} level={status} message={statusType.message} />;
};

export default ResourceSyncStatus;
