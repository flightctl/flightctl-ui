import * as React from 'react';
import { useAuth } from 'react-oidc-context';

import { AppRoutes } from '@app/routes';

import '@patternfly/react-core/dist/styles/base.css';
import '@app/app.css';

const App: React.FunctionComponent = () => {
  const auth = useAuth();
  switch (auth.activeNavigator) {
    case 'signinSilent':
      return <div>Signing you in...</div>;
    case 'signoutRedirect':
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    console.log(auth.error);
    return <div>Auth Error: {auth.error.toString() as React.ReactNode}</div>;
  }

  if (auth.isAuthenticated) {
    return <AppRoutes />;
  }
  void auth.signinRedirect();
  return <div>Redirecting...</div>;
};

export default App;
