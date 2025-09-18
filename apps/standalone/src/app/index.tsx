import * as React from 'react';
import { AppContext } from '@flightctl/ui-components/src/hooks/useAppContext';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';

import { AppRouter } from './routes';
import { useStandaloneAppContext } from './hooks/useStandaloneAppContext';
import { AuthContext, useAuthContext } from './context/AuthContext';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Text/text.css';

import './app.css';

const App: React.FunctionComponent = () => {
  const appContextValue = useStandaloneAppContext();
  const authContextValue = useAuthContext();

  return (
    <React.Suspense fallback={<div />}>
      <AuthContext.Provider value={authContextValue}>
        <AppContext.Provider value={appContextValue}>
          <SystemRestoreProvider>
            <AppRouter />
          </SystemRestoreProvider>
        </AppContext.Provider>
      </AuthContext.Provider>
    </React.Suspense>
  );
};

export default App;
