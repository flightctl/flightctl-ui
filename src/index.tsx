import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@app/index';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { UserPreferencesProvider } from '@app/components/UserPreferences/UserPreferencesProvider';

declare global {
  interface Window {
    KEYCLOAK_AUTHORITY?: string;
    KEYCLOAK_CLIENTID?: string;
    KEYCLOAK_REDIRECT?: string;
    API_PORT?: string;
  }
}

if (window.API_PORT) {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false,
      },
    ],
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000, config);
}
// initialize the keycloak instance
// pass the keycloak instance to the provider at the root of your app

const root = ReactDOM.createRoot(document.getElementById('root') as Element);

const rootApp = (
  <React.StrictMode>
    <UserPreferencesProvider>
      <App />
    </UserPreferencesProvider>
  </React.StrictMode>
);

if (window.KEYCLOAK_AUTHORITY && window.KEYCLOAK_CLIENTID && window.KEYCLOAK_REDIRECT) {
  const oidcConfig: AuthProviderProps = {
    authority: window.KEYCLOAK_AUTHORITY,
    client_id: window.KEYCLOAK_CLIENTID,
    redirect_uri: window.KEYCLOAK_REDIRECT + window.location.pathname,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    loadUserInfo: true,
  };
  root.render(<AuthProvider {...oidcConfig}>{rootApp}</AuthProvider>);
} else {
  root.render(rootApp);
}
