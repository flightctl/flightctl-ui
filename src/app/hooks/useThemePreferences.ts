import * as React from 'react';
import { useUserPreferences } from './useUserPreferences';

export const THEME_LOCAL_STORAGE_KEY = 'flightctl/theme';
const THEME_DARK_CLASS = 'pf-v5-theme-dark';

export type Theme = 'dark' | 'light' | 'system';

export const updateThemeClass = (htmlTagElement: HTMLElement, theme: string | null) => {
  const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (theme === 'dark' || (!theme && systemTheme === 'dark')) {
    htmlTagElement.classList.add(THEME_DARK_CLASS);
  } else {
    htmlTagElement.classList.remove(THEME_DARK_CLASS);
  }
};

const getTheme = (storageTheme: string | null): Theme => {
  switch (storageTheme) {
    case 'dark': {
      return 'dark';
    }
    case 'light': {
      return 'light';
    }
    default: {
      return 'system';
    }
  }
};

export const useThemePreferences = () => {
  const htmlTagElement = document.documentElement;
  const [value, setValue] = useUserPreferences(THEME_LOCAL_STORAGE_KEY);

  React.useEffect(() => {
    const mqListener = (e) => {
      if (e.matches) {
        htmlTagElement.classList.add(THEME_DARK_CLASS);
      } else {
        htmlTagElement.classList.remove(THEME_DARK_CLASS);
      }
    };
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    if (!value) {
      darkThemeMq.addEventListener('change', mqListener);
    }
    updateThemeClass(htmlTagElement, value);
    return () => darkThemeMq.removeEventListener('change', mqListener);
  }, [htmlTagElement, value]);

  const setThemeState = React.useCallback(
    (theme: Theme) => {
      setValue(theme);
      updateThemeClass(htmlTagElement, theme);
    },
    [htmlTagElement, setValue],
  );

  return {
    theme: getTheme(value),
    setTheme: setThemeState,
  };
};
