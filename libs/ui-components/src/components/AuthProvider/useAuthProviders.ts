import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { AuthProviderList } from '@flightctl/types';

export const useAuthProviders = () => {
  const [data, isLoading, error, refetch, isUpdating] = useFetchPeriodically<AuthProviderList>({
    endpoint: 'authproviders',
  });

  const providers = data?.items || [];

  return {
    providers,
    isLoading,
    error,
    refetch,
    isUpdating,
  };
};
