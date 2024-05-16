import * as React from 'react';
import { Label, LabelProps, List, ListItem, Popover, Stack, StackItem } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { ConditionType, ResourceSync } from '@flightctl/types';
import WithTooltip from '../common/WithTooltip';
import { getRepositorySyncStatus, repositoryStatusLabels } from '../../utils/status/repository';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';

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
      icon = <QuestionCircleIcon />;
      break;
  }

  if (color === 'red' && showLinksOnError) {
    const repositoryName = resourceSync.spec.repository;
    return (
      <Popover
        alertSeverityVariant="danger"
        triggerAction="hover"
        aria-label={t('Invalid resource sync configuration')}
        headerContent={t('Invalid resource sync configuration')}
        bodyContent={
          <Stack hasGutter>
            <StackItem>{statusType.message}</StackItem>
            <StackItem>
              {t('Use the links below to review the resource sync settings and correct the configuration.')}
              <List>
                <ListItem>
                  {t('Resource sync')}:{' '}
                  <Link to={{ route: ROUTE.RESOURCE_SYNC_DETAILS, postfix: resourceSync.metadata.name }}>
                    {resourceSync.metadata.name}
                  </Link>
                </ListItem>
                <ListItem>
                  {t('Repository')}:{' '}
                  <Link to={{ route: ROUTE.REPO_DETAILS, postfix: repositoryName }}>{repositoryName}</Link>
                </ListItem>
              </List>
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
