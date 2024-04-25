// eslint-disable-next-line no-restricted-imports
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useAppContext } from './useAppContext';

export const useTranslation = () => {
  const { i18n } = useAppContext();
  return useI18nTranslation(i18n.transNamespace);
};
