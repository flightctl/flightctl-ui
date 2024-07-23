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

const repoConfigTypes = ['git', 'http'];

const RepositorySourceList = ({ sourceItems }: { sourceItems: SourceItem[] }) => {
  const { get } = useFetch();
  const { t } = useTranslation();

  const nonRepoItems = sourceItems.filter((item) => !repoConfigTypes.includes(item.type));

  const [repoDetailItems, setRepoDetailItems] = React.useState<RepositorySourceDetails[]>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const repositoryItems = sourceItems.filter((item) => repoConfigTypes.includes(item.type));

  const configNames = useArrayEq(repositoryItems.map((item) => item.name));
  const repositoryNames = useArrayEq(repositoryItems.map((item) => item.details));
  const repositoryTypes = useArrayEq(repositoryItems.map((item) => item.type));

  React.useEffect(() => {
    const fetch = async () => {
      const promises = repositoryNames.map((r) => get<Repository>(`repositories/${r}`));
      const results = await Promise.allSettled(promises);

      const repoSourceItems: RepositorySourceDetails[] = results.map((result, index) => {
        const isRepoMissing = isPromiseRejected(result);
        const configName = configNames[index];
        const errorMessage = isRepoMissing
          ? `${t('The repository "{{name}}" defined for this source failed to load.', {
              name: repositoryNames[index],
            })} ${getErrorMessage(result.reason)}`
          : undefined;
        const url = isRepoMissing ? undefined : result.value.spec.url;
        return {
          name: configName,
          details: url,
          type: repositoryTypes[index] as 'git' | 'http',
          errorMessage,
        };
      });
      setRepoDetailItems(repoSourceItems);
      setIsLoading(false);
    };

    void fetch();
  }, [t, get, repositoryNames, configNames, repositoryTypes]);

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  const allItems: RepositorySourceDetails[] = repoDetailItems?.length
    ? repoDetailItems.concat(nonRepoItems)
    : nonRepoItems;
  return allItems.length > 0 ? (
    <Stack>
      {allItems.map((sourceDetails) => (
        <StackItem key={sourceDetails.name || sourceDetails.details}>
          <RepositorySource sourceDetails={sourceDetails} />
        </StackItem>
      ))}
    </Stack>
  ) : (
    '-'
  );
};

export default RepositorySourceList;
