import * as React from 'react';
import { useUserPreferences } from './useUserPreferences';

export const THEME_LOCAL_STORAGE_KEY = 'flightctl/theme';
export const OCP_CONSOLE_THEME_LOCAL_STORAGE_KEY = 'bridge/theme';

const THEME_DARK_CLASS = 'pf-v6-theme-dark';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = Exclude<Theme, 'system'>;

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

const getDarkThemeMq = () => window.matchMedia('(prefers-color-scheme: dark)');

const getResolvedTheme = (darkThemeMq: MediaQueryList, theme: string | null): ResolvedTheme => {
  const isDarkPreferred = darkThemeMq.matches;
  return theme === 'dark' || (isDarkPreferred && getTheme(theme) === 'system') ? 'dark' : 'light';
};

export const updateThemeClass = (htmlTagElement: HTMLElement, resolvedTheme: ResolvedTheme) => {
  if (resolvedTheme === 'dark') {
    htmlTagElement.classList.add(THEME_DARK_CLASS);
  } else {
    htmlTagElement.classList.remove(THEME_DARK_CLASS);
  }
};

export const useThemePreferences = () => {
  const htmlTagElement = document.documentElement;
  const [userTheme, setUserTheme] = useUserPreferences(THEME_LOCAL_STORAGE_KEY);
  const [consoleTheme] = useUserPreferences(OCP_CONSOLE_THEME_LOCAL_STORAGE_KEY);
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>('light');

  React.useEffect(() => {
    const mqListener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        htmlTagElement.classList.add(THEME_DARK_CLASS);
      } else {
        htmlTagElement.classList.remove(THEME_DARK_CLASS);
      }
    };
    const darkThemeMq = getDarkThemeMq();
    let actualTheme: ResolvedTheme;
    if (consoleTheme) {
      actualTheme = getResolvedTheme(darkThemeMq, consoleTheme);
    } else {
      actualTheme = getResolvedTheme(darkThemeMq, userTheme);
      updateThemeClass(htmlTagElement, actualTheme);
      if (!userTheme) {
        darkThemeMq.addEventListener('change', mqListener);
      }
    }
    setResolvedTheme(actualTheme);

    return () => {
      if (!consoleTheme && !userTheme) {
        darkThemeMq.removeEventListener('change', mqListener);
      }
    };
  }, [htmlTagElement, userTheme, consoleTheme]);

  const setThemeState = React.useCallback(
    (theme: Theme) => {
      const darkTheme = getDarkThemeMq();
      const actualTheme = getResolvedTheme(darkTheme, theme);
      updateThemeClass(htmlTagElement, actualTheme);
      setUserTheme(theme);
      setResolvedTheme(actualTheme);
    },
    [htmlTagElement, setUserTheme],
  );

  return {
    userTheme: getTheme(userTheme),
    setUserTheme: setThemeState,
    resolvedTheme,
  };
};
