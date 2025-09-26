import { AppContextProps } from '../hooks/useAppContext';

export const getBrandName = (settings: AppContextProps['settings']): string =>
  settings.isRHEM ? 'Red Hat Edge Manager' : 'Flight Control';
