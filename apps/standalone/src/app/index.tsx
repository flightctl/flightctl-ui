import * as React from 'react';
import { AppRouter } from './routes';

import { AppContext } from '@flightctl/ui-components/hooks/useAppContext';
import { useAuth } from './hooks/useAuth';
import { useStandaloneAppContext } from './hooks/useStandaloneAppContext';

import '@patternfly/react-core/dist/styles/base.css';
import './app.css';

const App: React.FunctionComponent = () => {
  const auth = useAuth();

  const appContextValue = useStandaloneAppContext();

  if (!auth) {
    return (
      <React.Suspense fallback={<div />}>
        <AppContext.Provider value={appContextValue}>
          <AppRouter />
        </AppContext.Provider>
      </React.Suspense>
    );
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
    return (
      <React.Suspense fallback={<div />}>
        <AppContext.Provider value={appContextValue}>
          <AppRouter />
        </AppContext.Provider>
      </React.Suspense>
    );
  }
  void auth.signinRedirect();
  return <div>Redirecting...</div>;
};

export default App;
