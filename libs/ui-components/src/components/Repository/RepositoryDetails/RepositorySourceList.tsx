import React from 'react';
import { Spinner, Stack, StackItem } from '@patternfly/react-core';

import { Repository } from '@flightctl/types';
import { useFetch } from '../../../hooks/useFetch';
import { isPromiseRejected } from '../../../types/typeUtils';
import { getErrorMessage } from '../../../utils/error';
import RepositorySource, { RepositorySourceDetails } from './RepositorySource';
import { useTranslation } from '../../../hooks/useTranslation';
import { SourceItem } from '../../../utils/devices';

const useArrayEq = (array: string[]) => {
  const prevArrayRef = React.useRef(array);

  if (prevArrayRef.current.length !== array.length || prevArrayRef.current.some((item) => !array.includes(item))) {
    prevArrayRef.current = array;
  }

  return prevArrayRef.current;
};

const RepositorySourceList = ({ sourceItems }: { sourceItems: SourceItem[] }) => {
  const { get } = useFetch();
  const { t } = useTranslation();

  const nonRepoItems = sourceItems
    .filter((item) => item.type !== 'git')
    .map((item) => ({
      name: item.displayText || item.name,
      type: item.type,
    }));

  const [repoDetailItems, setRepoDetailItems] = React.useState<RepositorySourceDetails[]>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const gitRepoItems = sourceItems.filter((item) => item.type === 'git');
  const repositoryNames = useArrayEq(gitRepoItems.map((item) => item.name));
  const repositorySourceNames = useArrayEq(gitRepoItems.map((item) => item.displayText));

  React.useEffect(() => {
    const fetch = async () => {
      const promises = repositoryNames.map((r) => get<Repository>(`repositories/${r}`));
      const results = await Promise.allSettled(promises);

      const repoSourceItems: RepositorySourceDetails[] = results.map((result, index) => {
        const isRepoMissing = isPromiseRejected(result);
        const name = repositorySourceNames[index];
        const errorMessage = isRepoMissing
          ? `${t('The repository "{{name}}" defined for this source failed to load.', {
              name: repositoryNames[index],
            })} ${getErrorMessage(result.reason)}`
          : undefined;
        const url = isRepoMissing ? undefined : result.value.spec.url;
        return {
          name,
          url,
          type: 'git' as RepositorySourceDetails['type'],
          errorMessage,
        };
      });
      setRepoDetailItems(repoSourceItems);
      setIsLoading(false);
    };

    void fetch();
  }, [t, get, repositoryNames, repositorySourceNames]);

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  const allItems: RepositorySourceDetails[] = repoDetailItems?.length
    ? repoDetailItems.concat(nonRepoItems)
    : nonRepoItems;
  return allItems.length > 0 ? (
    <Stack>
      {allItems.map((sourceDetails) => (
        <StackItem key={sourceDetails.name || sourceDetails.url}>
          <RepositorySource sourceDetails={sourceDetails} />
        </StackItem>
      ))}
    </Stack>
  ) : (
    '-'
  );
};

export default RepositorySourceList;
