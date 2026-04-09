import * as React from 'react';
import { UserPreferencesContext } from '@flightctl/ui-components/src/components/Masthead/UserPreferencesProvider';
import { useAppContext } from '@flightctl/ui-components/src/hooks/useAppContext';

import fcLogo from '@fctl-assets/bgimages/flight-control-logo.svg';
import rhemLogoLight from '@fctl-assets/bgimages/RHEM-logo-light.svg';
import rhemLogoDark from '@fctl-assets/bgimages/RHEM-logo.svg';

export type BrandLogoResult = {
  logo: string;
  altText: string;
};

export const useBrandLogo = (): BrandLogoResult => {
  const { settings } = useAppContext();
  const { resolvedTheme } = React.useContext(UserPreferencesContext);
  const isRHEM = settings.isRHEM ?? false;
  const isDarkTheme = resolvedTheme === 'dark';

  if (isRHEM) {
    return {
      logo: isDarkTheme ? rhemLogoDark : rhemLogoLight,
      altText: 'Red Hat Edge Manager logo',
    };
  }
  return {
    logo: fcLogo,
    altText: 'Flight Control logo',
  };
};
