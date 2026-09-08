import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { type AuthProviderList } from '@flightctl/types';

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
