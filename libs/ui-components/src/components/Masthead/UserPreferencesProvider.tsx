import * as React from 'react';
import { ResolvedTheme, Theme, useThemePreferences } from '../../hooks/useThemePreferences';

type ThemeContext = {
  userTheme: Theme; // Theme setting chosen by the user
  resolvedTheme: ResolvedTheme; // Resolved theme based on user theme and system settings
  setUserTheme: (theme: Theme) => void;
};

export const UserPreferencesContext = React.createContext<ThemeContext>({
  userTheme: 'system',
  resolvedTheme: 'dark',
  setUserTheme: () => {},
});

export type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { userTheme, resolvedTheme, setUserTheme } = useThemePreferences();

  return (
    <UserPreferencesContext.Provider
      value={{
        userTheme,
        resolvedTheme,
        setUserTheme,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};
