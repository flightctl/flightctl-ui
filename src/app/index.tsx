import * as React from 'react';
import { useAuth } from '@app/hooks/useAuth';
import { AppRouter } from '@app/routes';

import '@patternfly/react-core/dist/styles/base.css';
import '@app/app.css';

const App: React.FunctionComponent = () => {
  const auth = useAuth();

  if (!auth) {
    return <AppRouter />;
  }

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
    console.log(auth.error); // eslint-disable-line no-console
    return <div>Auth Error: {auth.error.toString() as React.ReactNode}</div>;
  }

  if (auth.isAuthenticated) {
    return <AppRouter />;
  }
  void auth.signinRedirect();
  return <div>Redirecting...</div>;
};

export default App;
