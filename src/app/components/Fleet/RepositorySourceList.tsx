import React from 'react';

import { Alert, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { useFetch } from '@app/hooks/useFetch';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@app/utils/error';
import { Repository } from '@types';
import { RepositoryURLLink } from '../Repository/RepositoryDetails/Tabs/DetailsTab';
import { isPromiseRejected } from '@app/types/typeUtils';

const useArrayEq = (array: string[]) => {
  const prevArrayRef = React.useRef(array);

  if (prevArrayRef.current.length !== array.length || prevArrayRef.current.some((item) => !array.includes(item))) {
    prevArrayRef.current = array;
  }

  return prevArrayRef.current;
};

const RepositorySourceList = ({ repositorySources }: { repositorySources: string[] }) => {
  const { t } = useTranslation();
  const { get } = useFetch();

  const [repoLinks, setRepoLinks] = React.useState<string[]>();
  const [errors, setErrors] = React.useState<string[]>();

  const sources = useArrayEq(repositorySources);

  React.useEffect(() => {
    setErrors(undefined);
    const fetch = async () => {
      const promises = sources.map((r) => get<Repository>(`repositories/${r}`));
      const results = await Promise.allSettled(promises);
      const failed = results.some(isPromiseRejected);
      if (failed) {
        const failures = results.reduce((acc, curr, index) => {
          if (curr.status === 'rejected') {
            acc.push(`${sources[index]}: ${getErrorMessage(curr.reason)}`);
          }
          return acc;
        }, [] as string[]);
        setErrors(failures);
      } else {
        setRepoLinks(results.map((r) => (r as PromiseFulfilledResult<Repository>).value.spec.repo || '-'));
      }
    };
    fetch();
  }, [get, sources]);

  if (errors) {
    return (
      <Alert isInline variant="danger" title={t('Failed to fetch repositories')}>
        <Stack>{errors?.map((e) => <StackItem key={e}>{e}</StackItem>)}</Stack>
      </Alert>
    );
  }
  if (!repoLinks) {
    return <Spinner />;
  }

  return repoLinks.length > 0 ? (
    <Stack>
      {repoLinks.map((link) => (
        <StackItem key={link}>
          <RepositoryURLLink url={link} />
        </StackItem>
      ))}
    </Stack>
  ) : (
    '-'
  );
};

export default RepositorySourceList;
