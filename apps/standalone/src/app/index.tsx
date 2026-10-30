import * as React from 'react';
import { NavigationGuardProvider } from '@flightctl/ui-components/src/components/common/NavigationGuard';
import { FLIGHTCTL_APP_CLASS } from '@flightctl/ui-components/src/constants';
import { AppContext } from '@flightctl/ui-components/src/hooks/useAppContext';

import { AppRouter } from './routes';
import { useStandaloneAppContext } from './hooks/useStandaloneAppContext';
import { AuthContext, useAuthContext } from './context/AuthContext';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Text/text.css';

import '@flightctl/ui-components/src/styles/global.css';
import './app.css';

const App: React.FunctionComponent = () => {
  const appContextValue = useStandaloneAppContext();
  const authContextValue = useAuthContext();

  return (
    <React.Suspense fallback={<div />}>
      <AuthContext.Provider value={authContextValue}>
        <AppContext.Provider value={appContextValue}>
          <NavigationGuardProvider>
            <div className={FLIGHTCTL_APP_CLASS}>
              <AppRouter />
            </div>
          </NavigationGuardProvider>
        </AppContext.Provider>
      </AuthContext.Provider>
    </React.Suspense>
  );
};

export default App;
