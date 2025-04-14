import React from 'react';
import ReactDOM, { render } from 'react-dom';
import App from './app/index';
import { UserPreferencesProvider } from '@flightctl/ui-components/src/components/Masthead/UserPreferencesProvider';
import './i18n';

declare global {
  interface Window {
    API_PORT?: string;
    isRHEM?: boolean;
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

const root = document.getElementById('root') as Element;

const rootApp = (
  <React.StrictMode>
    <UserPreferencesProvider>
      <App />
    </UserPreferencesProvider>
  </React.StrictMode>
);

render(rootApp, root);
