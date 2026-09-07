import { useAppContext } from '../../hooks/useAppContext';
import { useTranslation } from '../../hooks/useTranslation';

export const useQuickStartProductName = (): string => {
  const { t } = useTranslation();
  const { settings } = useAppContext();

  return settings.isRHEM ? t('Red Hat Edge Manager') : t('Flight Control');
};
