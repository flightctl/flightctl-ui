import * as React from 'react';
import { Theme, useThemePreferences } from '@app/hooks/useThemePreferences';
import { useUserPreferences } from '@app/hooks/useUserPreferences';

export const EXPERIMENTAL_LOCAL_STORAGE_KEY = 'flightctl/experimental';

export const UserPreferencesContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  experimentalFeatures: boolean;
  setExperimentalFeatures: (enable: boolean) => void;
}>({
  theme: 'system',
  setTheme: () => {},
  experimentalFeatures: false,
  setExperimentalFeatures: () => {},
});

export type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { theme, setTheme } = useThemePreferences();
  const [experimentalFeatures, setExperimentalFeatures] = useUserPreferences(EXPERIMENTAL_LOCAL_STORAGE_KEY);

  const enableExperimentalFeatures = React.useCallback(
    (value: boolean) => {
      setExperimentalFeatures(value ? 'True' : 'False');
    },
    [setExperimentalFeatures],
  );
  return (
    <UserPreferencesContext.Provider
      value={{
        theme,
        setTheme,
        experimentalFeatures: experimentalFeatures === 'True',
        setExperimentalFeatures: enableExperimentalFeatures,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};
