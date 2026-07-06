import { TFunction } from 'i18next';
import { Condition, ConditionStatus, ConditionType, Repository, ResourceSync } from '@flightctl/types';
import { timeSinceText } from '../dates';
import { getConditionMessage } from '../error';
import { getCondition } from '../api';

export type RepositorySyncStatus =
  | ConditionType.ResourceSyncSynced
  | 'Not synced'
  | ConditionType.ResourceSyncResourceParsed
  | 'Not parsed'
  | ConditionType.RepositoryAccessible
  | 'Not accessible'
  | 'Sync pending';

const repositoryStatusLabels = (t: TFunction) => ({
  [ConditionType.ResourceSyncSynced]: t('Synced'),
  'Not synced': t('Not synced'),
  [ConditionType.ResourceSyncResourceParsed]: t('Parsed'),
  'Not parsed': t('Not parsed'),
  [ConditionType.RepositoryAccessible]: t('Accessible'),
  'Not accessible': t('Not accessible'),
  'Sync pending': t('Sync pending'),
});

export const isAccessibleRepository = (repository: Repository): boolean => {
  const conditions = repository.status?.conditions;
  // By default it checks for true condition
  return getCondition(conditions, ConditionType.RepositoryAccessible) !== undefined;
};

const getRepositorySyncStatus = (
  repository: Repository | ResourceSync,
  t: TFunction = (s: string) => s,
): {
  status: RepositorySyncStatus;
  message: string | undefined;
} => {
  const conditions = repository.status?.conditions;

  const accessibleCondition = conditions?.find((c) => c.type === ConditionType.RepositoryAccessible);
  if (accessibleCondition?.status === ConditionStatus.ConditionStatusFalse) {
    return {
      status: 'Not accessible',
      message: getConditionMessage(accessibleCondition),
    };
  }

  const parsedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncResourceParsed);
  if (parsedCondition?.status === ConditionStatus.ConditionStatusFalse) {
    return {
      status: 'Not parsed',
      message: getConditionMessage(parsedCondition),
    };
  }

  const syncedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncSynced);
  if (syncedCondition?.status === ConditionStatus.ConditionStatusFalse) {
    return {
      status: 'Not synced',
      message: getConditionMessage(syncedCondition),
    };
  }

  // Now there are no error situations we know of, let's return the most "advanced" status
  if (syncedCondition) {
    return {
      status: ConditionType.ResourceSyncSynced,
      message: '',
    };
  }
  if (parsedCondition) {
    return {
      status: ConditionType.ResourceSyncResourceParsed,
      message: '',
    };
  }
  if (accessibleCondition) {
    return {
      status: ConditionType.RepositoryAccessible,
      message: '',
    };
  }

  // As a fallback, we indicate the repository is waiting for sync
  return {
    status: 'Sync pending',
    message: t('Awaiting first sync'),
  };
};

export const getLastTransitionTime = (conditions?: Condition[]): string | undefined => {
  let lastTime: string | undefined = undefined;

  conditions?.forEach((condition) => {
    if (!lastTime || (!!condition.lastTransitionTime && condition.lastTransitionTime > lastTime)) {
      lastTime = condition.lastTransitionTime;
    }
  });

  return lastTime;
};

const getLastTransitionTimeText = (
  repository: Repository,
  t: TFunction = (s: string) => s,
): {
  text: string;
  timestamp: string;
} => {
  const lastTime = getLastTransitionTime(repository.status?.conditions);

  return {
    text: lastTime ? timeSinceText(t, lastTime) : 'N/A',
    timestamp: lastTime || '0',
  };
};

const getObservedHash = (resourceSync: ResourceSync): string | undefined => {
  const lastHash = resourceSync.status?.observedCommit;
  return lastHash ? lastHash.substring(0, 7) : '-';
};

export { getRepositorySyncStatus, getLastTransitionTimeText, getObservedHash, repositoryStatusLabels };
