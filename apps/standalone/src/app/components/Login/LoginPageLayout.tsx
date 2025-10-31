import * as React from 'react';
import { Bullseye, Page, PageSection } from '@patternfly/react-core';

const THEME_DARK_CLASS = 'pf-v5-theme-dark';

const updateThemeClass = (isDark: boolean) => {
  const htmlElement = document.documentElement;
  if (isDark) {
    htmlElement.classList.add(THEME_DARK_CLASS);
  } else {
    htmlElement.classList.remove(THEME_DARK_CLASS);
  }
};

// Hook to detect browser's theme preference for login page (before user has preferences)
const useBrowserTheme = () => {
  const [isDark, setIsDark] = React.useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    updateThemeClass(darkThemeMq.matches);

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      updateThemeClass(e.matches);
    };

    darkThemeMq.addEventListener('change', listener);

    return () => {
      darkThemeMq.removeEventListener('change', listener);
    };
  }, []);

  return isDark ? 'dark' : 'light';
};

const LoginPageLayout = ({ children }: React.PropsWithChildren) => {
  const theme = useBrowserTheme();

  return (
    <Page>
      <PageSection variant={theme} isFilled>
        <Bullseye>{children}</Bullseye>
      </PageSection>
    </Page>
  );
};

export default LoginPageLayout;
