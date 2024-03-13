import { ConditionType, Repository, ResourceSync } from '@types';
import { timeSinceText } from '@app/utils/dates';

const getRepositorySyncStatus = (
  repository: Repository | ResourceSync,
): {
  status: string;
  message: string | undefined;
} => {
  const conditions = repository.status?.conditions;

  const syncedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncSynced);
  if (syncedCondition) {
    const isOK = syncedCondition.status === 'True';
    return {
      status: isOK ? ConditionType.ResourceSyncSynced : 'Not synced',
      message: isOK ? '' : syncedCondition.message,
    };
  }

  const parsedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncResourceParsed);
  if (parsedCondition) {
    const isOK = parsedCondition.status === 'True';
    return {
      status: isOK ? ConditionType.ResourceSyncResourceParsed : 'Not parsed',
      message: isOK ? '' : parsedCondition.message,
    };
  }

  const accessibleCondition = conditions?.find((c) => c.type === ConditionType.RepositoryAccessible);
  if (accessibleCondition) {
    const isOK = accessibleCondition.status === 'True';
    return {
      status: isOK ? ConditionType.RepositoryAccessible : 'Not accessible',
      message: isOK ? '' : accessibleCondition.message,
    };
  }

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
