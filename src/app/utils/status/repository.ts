import { ConditionType, Repository } from '@types';
import { RepositorySyncStatus } from '@app/types/extraTypes';

const getRepositorySyncStatus = (
  repository: Repository,
): {
  status: RepositorySyncStatus;
  message: string;
} => {
  const conditions = repository.status?.conditions;

  const syncedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncSynced);
  if (syncedCondition) {
    return {
      status: syncedCondition.status === 'True' ? ConditionType.ResourceSyncSynced : 'NotSynced',
      message: syncedCondition.message || '',
    };
  }

  const parsedCondition = conditions?.find((c) => c.type === ConditionType.ResourceSyncResourceParsed);
  if (parsedCondition) {
    return {
      status: parsedCondition.status === 'True' ? ConditionType.ResourceSyncResourceParsed : 'NotParsed',
      message: parsedCondition.message || '',
    };
  }

  const accessibleCondition = conditions?.find((c) => c.type === ConditionType.RepositoryAccessible);
  if (accessibleCondition) {
    return {
      status: accessibleCondition.status === 'True' ? ConditionType.RepositoryAccessible : 'NotAccessible',
      message: accessibleCondition.message || '',
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
  return lastTime;
};

export { getRepositorySyncStatus, getRepositoryLastTransitionTime };
