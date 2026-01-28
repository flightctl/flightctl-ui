import * as React from 'react';

import { RepoSpecType, Repository, RepositoryList } from '@flightctl/types';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';

export type OciRegistriesContextType = {
  ociRegistries: Repository[];
  isLoading: boolean;
  error: unknown;
  refetch: VoidFunction;
};

const OciRegistriesContext = React.createContext<OciRegistriesContextType | undefined>(undefined);

export const OciRegistriesContextProvider = ({ children }: React.PropsWithChildren) => {
  const [repoList, isLoading, error, refetch] = useFetchPeriodically<RepositoryList>({
    endpoint: `repositories?fieldSelector=spec.type=${RepoSpecType.RepoSpecTypeOci}`,
  });

  const ociRegistries = React.useMemo(() => repoList?.items || [], [repoList]);

  const context = React.useMemo(
    () => ({
      ociRegistries,
      isLoading,
      error,
      refetch,
    }),
    [ociRegistries, isLoading, error, refetch],
  );

  return <OciRegistriesContext.Provider value={context}>{children}</OciRegistriesContext.Provider>;
};

export const useOciRegistriesContext = (): OciRegistriesContextType => {
  const context = React.useContext(OciRegistriesContext);
  if (context === undefined) {
    throw new Error('useOciRegistriesContext must be used within an OciRegistriesContextProvider');
  }
  return context;
};
