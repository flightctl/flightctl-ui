import * as React from 'react';
import { Bullseye, Page, PageSection } from '@patternfly/react-core';
import { updateThemeClass } from '@flightctl/ui-components/src/hooks/useThemePreferences';

// Hook to detect browser's theme preference for login page (before user has preferences)
const useBrowserTheme = () => {
  const [isDark, setIsDark] = React.useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    updateThemeClass(document.documentElement, darkThemeMq.matches ? 'dark' : 'light');

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      updateThemeClass(document.documentElement, e.matches ? 'dark' : 'light');
    };

    darkThemeMq.addEventListener('change', listener);

    return () => {
      darkThemeMq.removeEventListener('change', listener);
    };
  }, []);

  return isDark ? 'dark' : 'light';
};

const LoginPageLayout = ({ children }: React.PropsWithChildren) => {
  // CELIA-WIP check if theme is applied correctly
  return (
    <Page>
      <PageSection hasBodyWrapper={false} type="default" isFilled>
        <Bullseye>{children}</Bullseye>
      </PageSection>
    </Page>
  );
};

export default LoginPageLayout;
