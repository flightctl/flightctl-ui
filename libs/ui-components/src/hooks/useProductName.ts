import { useAppContext } from './useAppContext';
import { useTranslation } from './useTranslation';

export const useProductName = (): string => {
  const { t } = useTranslation();
  const { settings } = useAppContext();

  return settings.isRHEM ? t('Red Hat Edge Manager') : t('Flight Control');
};
