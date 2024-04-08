import { ConditionStatus, ConditionType, Repository, ResourceSync } from '@types';
import { timeSinceText } from '@app/utils/dates';

export type RepositorySyncStatus =
  | ConditionType.ResourceSyncSynced
  | 'Not synced'
  | ConditionType.ResourceSyncResourceParsed
  | 'Not parsed'
  | ConditionType.RepositoryAccessible
  | 'Not accessible'
  | 'Sync pending';

const getRepositorySyncStatus = (
  repository: Repository | ResourceSync,
): {
  status: RepositorySyncStatus;
  message: string | undefined;
} => {
  const conditions = repository.status?.conditions;

  const accessibleCondition = conditions?.find((c) => c.type === ConditionType.RepositoryAccessible);
  if (accessibleCondition?.status === ConditionStatus.ConditionStatusFalse) {
    return {
      status: 'Not accessible',
      message: accessibleCondition.message,
    };
  }

  const parsedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncResourceParsed);
  if (parsedCondition?.status === ConditionStatus.ConditionStatusFalse) {
    return {
      status: 'Not parsed',
      message: parsedCondition.message,
    };
  }

  const syncedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncSynced);
  if (syncedCondition?.status === ConditionStatus.ConditionStatusFalse) {
    return {
      status: 'Not synced',
      message: syncedCondition.message,
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
    message: 'Waiting for first sync',
  };
};

const getRepositoryLastTransitionTime = (
  repository: Repository,
): {
  text: string;
  timestamp: string;
} => {
  const conditions = repository.status?.conditions;

  let lastTime: string | undefined = undefined;

  conditions?.forEach((condition) => {
    if (!lastTime || (!!condition.lastTransitionTime && condition.lastTransitionTime > lastTime)) {
      lastTime = condition.lastTransitionTime;
    }
  });

  return {
    text: lastTime ? `${timeSinceText(new Date(lastTime).getTime())} ago` : '-',
    timestamp: lastTime || '0',
  };
};

const getObservedHash = (resourceSync: ResourceSync): string | undefined => {
  const lastHash = resourceSync.status?.observedCommit;
  return lastHash ? lastHash.substring(0, 7) : '-';
};

export { getRepositorySyncStatus, getRepositoryLastTransitionTime, getObservedHash };
