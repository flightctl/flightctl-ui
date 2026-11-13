import * as React from 'react';
import { useAppContext } from './useAppContext';

// a custom hook for setting the page title
export function useDocumentTitle(title: string) {
  const { settings } = useAppContext();
  const appTitle = settings.isRHEM ? 'Edge Manager' : 'Flight Control';
  const documentTitle = `${appTitle} | ${title}`;

  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = documentTitle;
    return () => {
      document.title = originalTitle;
    };
  }, [documentTitle]);
}
