import { ConditionStatus, ConditionType, RepoSpecType, Repository } from '@flightctl/types';

const repoList: Repository[] = [
  {
    apiVersion: 'v1alpha1',
    kind: 'Repository',
    metadata: {
      creationTimestamp: '2024-04-30T14:05:53Z',
      labels: {},
      name: 'git-init-repo',
    },
    spec: {
      url: 'https://github.com/flightctl/flightctl-demos',
      type: RepoSpecType.GIT,
    },
    status: {
      conditions: [
        {
          lastTransitionTime: '2024-04-30T14:06:16Z',
          message: 'Accessible',
          reason: 'Accessible',
          status: ConditionStatus.ConditionStatusTrue,
          type: ConditionType.RepositoryAccessible,
        },
      ],
    },
  },
];

export { repoList };
