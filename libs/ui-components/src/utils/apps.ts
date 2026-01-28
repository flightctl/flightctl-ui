import { TFunction } from 'react-i18next';

import { AppType } from '@flightctl/types';

export const appTypeOptions = (t: TFunction) => ({
  [AppType.AppTypeContainer]: t('Single Container application'),
  [AppType.AppTypeQuadlet]: t('Quadlet application'),
  [AppType.AppTypeHelm]: t('Helm application'),
  [AppType.AppTypeCompose]: t('Compose application'),
});

export const getAppTypeLabel = (appType: AppType, t: TFunction): string => {
  const labels: Record<AppType, string> = {
    [AppType.AppTypeContainer]: t('Single Container'),
    [AppType.AppTypeQuadlet]: t('Quadlet'),
    [AppType.AppTypeCompose]: t('Compose'),
    [AppType.AppTypeHelm]: t('Helm'),
  };
  return labels[appType] || t('Unknown');
};
