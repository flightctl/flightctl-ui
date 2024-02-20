import { ConditionType, Repository } from '@types';
import { RepositorySyncStatus } from '@app/types/extraTypes';

const getRepositorySyncStatus = (
  repository: Repository,
): {
  status: RepositorySyncStatus;
  message: string | undefined;
} => {
  const conditions = repository.status?.conditions;

  const syncedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncSynced);
  if (syncedCondition) {
    const isOK = syncedCondition.status === 'True';
    return {
      status: isOK ? ConditionType.ResourceSyncSynced : 'NotSynced',
      message: isOK ? '' : syncedCondition.message,
    };
  }

  const parsedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncResourceParsed);
  if (parsedCondition) {
    const isOK = parsedCondition.status === 'True';
    return {
      status: isOK ? ConditionType.ResourceSyncResourceParsed : 'NotParsed',
      message: isOK ? '' : parsedCondition.message,
    };
  }

  const accessibleCondition = conditions?.find((c) => c.type === ConditionType.RepositoryAccessible);
  if (accessibleCondition) {
    const isOK = accessibleCondition.status === 'True';
    return {
      status: isOK ? ConditionType.RepositoryAccessible : 'NotAccessible',
      message: isOK ? '' : accessibleCondition.message,
    };
  }

  return {
    status: 'Unknown',
    message: '',
  };
};

const getRepositoryLastTransitionTime = (repository: Repository): string | undefined => {
  const conditions = repository.status?.conditions;

  let lastTime: string | undefined = undefined;

  conditions?.forEach((condition) => {
    if (!lastTime || (!!condition.lastTransitionTime && condition.lastTransitionTime > lastTime)) {
      lastTime = condition.lastTransitionTime;
    }
  });
  return lastTime || '-';
};

export { getRepositorySyncStatus, getRepositoryLastTransitionTime };
