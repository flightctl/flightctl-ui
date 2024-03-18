import * as React from 'react';
import { Theme, useThemePreferences } from '@app/hooks/useThemePreferences';

export const UserPreferencesContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'system',
  setTheme: () => {},
});

export type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { theme, setTheme } = useThemePreferences();

  return (
    <UserPreferencesContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};
