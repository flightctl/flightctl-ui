import React from "react";
import ReactDOM from "react-dom/client";
import App from '@app/index';
import { AuthProvider } from "react-oidc-context";

declare global {
  interface Window {
    env: {
      REACT_APP_KEYCLOAK_AUTHORITY: string;
      KEYCLOAK_CLIENTID: string;
      KEYCLOAK_REDIRECT: string;
      WS_URL: string;
    };
  }
}

const KEYCLOAK_AUTHORITY = process.env.NODE_ENV === 'production' ? window.env.REACT_APP_KEYCLOAK_AUTHORITY : process.env.REACT_APP_KEYCLOAK_AUTHORITY || "http://localhost:9080/realms/flightctl"
const KEYCLOAK_CLIENTID = process.env.NODE_ENV === 'production' ? window.env.KEYCLOAK_CLIENTID : process.env.REACT_APP_KEYCLOAK_CLIENTID || "flightctl-ui"
const KEYCLOAK_REDIRECT = process.env.NODE_ENV === 'production' ? window.env.KEYCLOAK_REDIRECT : process.env.REACT_APP_KEYCLOAK_REDIRECT || "http://localhost:9000" 
const WS_URL = process.env.NODE_ENV === 'production' ? window.env.WS_URL : process.env.WS_URL || "http://localhost:8082" 
console.log("Iwindow.env.WS_URL: " + window.env.WS_URL);
console.log("Iwindow.env: " + window.env);
console.log("Iprocess.env: " + process.env);
console.log("Iprocess.env.WS_URL: " + process.env.WS_URL);
console.log("IWS_URL: " + WS_URL);
const oidcConfig = {
  authority: KEYCLOAK_AUTHORITY,
  client_id: KEYCLOAK_CLIENTID,
  redirect_uri: KEYCLOAK_REDIRECT + window.location.pathname,
  response_type: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
  loadUserInfo: true
};

if (process.env.NODE_ENV !== "production") {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false
      }
    ]
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000, config);
}
// initialize the keycloak instance
// pass the keycloak instance to the provider at the root of your app


const root = ReactDOM.createRoot(document.getElementById('root') as Element);

root.render(
  <AuthProvider {...oidcConfig}>
    <React.StrictMode>
        <App />
    </React.StrictMode>
  </AuthProvider>
)
