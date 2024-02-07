import * as React from 'react';

export const THEME_LOCAL_STORAGE_KEY = 'flightctl/theme';
const THEME_DARK_CLASS = 'pf-v5-theme-dark';

type Theme = 'dark' | 'light';

export const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'light',
  setTheme: () => {},
});

export const updateThemeClass = (htmlTagElement: HTMLElement, theme: string | null) => {
  const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (theme === 'dark' || (!theme && systemTheme === 'dark')) {
    htmlTagElement.classList.add(THEME_DARK_CLASS);
  } else {
    htmlTagElement.classList.remove(THEME_DARK_CLASS);
  }
};

const getInitTheme = (): Theme => {
  const storageTheme = localStorage.getItem(THEME_LOCAL_STORAGE_KEY);
  switch (storageTheme) {
    case 'dark': {
      return 'dark';
    }
    case 'light': {
      return 'light';
    }
    default: {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
  }
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const htmlTagElement = document.documentElement;
  const [theme, setTheme] = React.useState<Theme>(getInitTheme());
  const storageTheme = localStorage.getItem(THEME_LOCAL_STORAGE_KEY);

  React.useEffect(() => {
    const mqListener = (e) => {
      if (e.matches) {
        htmlTagElement.classList.add(THEME_DARK_CLASS);
      } else {
        htmlTagElement.classList.remove(THEME_DARK_CLASS);
      }
    };
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    if (!storageTheme) {
      darkThemeMq.addEventListener('change', mqListener);
    }
    updateThemeClass(htmlTagElement, storageTheme);
    return () => darkThemeMq.removeEventListener('change', mqListener);
  }, [htmlTagElement, storageTheme]);

  const setThemeState = React.useCallback(
    (theme: Theme) => {
      localStorage.setItem(THEME_LOCAL_STORAGE_KEY, theme);
      setTheme(theme);
      updateThemeClass(htmlTagElement, theme);
    },
    [htmlTagElement],
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
