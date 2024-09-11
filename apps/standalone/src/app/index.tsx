import * as React from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { AppContext } from '@flightctl/ui-components/src/hooks/useAppContext';

import { AppRouter } from './routes';
import { useStandaloneAppContext } from './hooks/useStandaloneAppContext';
import { AuthContext, useAuthContext } from './context/AuthContext';

import '@patternfly/react-core/dist/styles/base.css';
import './app.css';

const App: React.FunctionComponent = () => {
  const appContextValue = useStandaloneAppContext();
  const authContextValue = useAuthContext();

  if (authContextValue.loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <React.Suspense fallback={<div />}>
      <AuthContext.Provider value={authContextValue}>
        <AppContext.Provider value={appContextValue}>
          <AppRouter />
        </AppContext.Provider>
      </AuthContext.Provider>
    </React.Suspense>
  );
};

export default App;
