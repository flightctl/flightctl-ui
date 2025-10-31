import { TFunction } from 'react-i18next';
import { AuthProvider } from '@flightctl/types';
import { ProviderType } from '../types/extraTypes';

export const getProviderDisplayName = (provider: AuthProvider, t: TFunction): string => {
  const spec = provider.spec;
  if ('displayName' in spec && spec.displayName) {
    return spec.displayName;
  }
  if (provider.spec.providerType === ProviderType.K8s) {
    return t('Kubernetes');
  }

  if (provider.spec.providerType === ProviderType.AAP) {
    return t('Ansible Automation Platform');
  }
  return provider.metadata.name as string;
};
