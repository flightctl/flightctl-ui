import React from 'react';
import ReactDOM, { render } from 'react-dom';
import App from './app/index';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { UserPreferencesProvider } from '@flightctl/ui-components/src/components/UserPreferences/UserPreferencesProvider';
import './i18n';

declare global {
  interface Window {
    KEYCLOAK_AUTHORITY?: string;
    KEYCLOAK_CLIENTID?: string;
    KEYCLOAK_REDIRECT?: string;
    API_PORT?: string;
    QCOW2_IMG_URL?: string;
    BOOTC_IMG_URL?: string;
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
  // eslint-disable-next-line
  const axe = require('react-axe');
  // eslint-disable-next-line
  axe(React, ReactDOM, 1000, config);
}
// initialize the keycloak instance
// pass the keycloak instance to the provider at the root of your app

const root = document.getElementById('root') as Element;

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
  render(<AuthProvider {...oidcConfig}>{rootApp}</AuthProvider>, root);
} else {
  render(rootApp, root);
}
