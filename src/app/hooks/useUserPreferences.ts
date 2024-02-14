import * as React from 'react';

export const useUserPreferences = (userPreferencesKey: string): [string | null, (value: string) => void] => {
  const userPreferencesStorage = localStorage.getItem(userPreferencesKey);
  const [userPreferences, setUserPreferences] = React.useState(userPreferencesStorage);

  const setUserPreferencesState = React.useCallback(
    (value: string) => {
      localStorage.setItem(userPreferencesKey, value);
      setUserPreferences(value);
    },
    [userPreferencesKey],
  );

  return [userPreferences, setUserPreferencesState];
};
