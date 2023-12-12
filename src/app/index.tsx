import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { useAuth } from "react-oidc-context";

const App: React.FunctionComponent = () => {
  const auth = useAuth();
  switch (auth.activeNavigator) {
    case "signinSilent":
        return <div>Signing you in...</div>;
    case "signoutRedirect":
        return <div>Signing you out...</div>;
  }    
  
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    void auth.signinRedirect();
  }

  if (auth.isAuthenticated) {
    return (
      <Router>
          <AppLayout>
            <AppRoutes />         
          </AppLayout>
      </Router>
    );
  }
  void auth.signinRedirect();
};


export default App;

//const App: React.FunctionComponent = () => (
//  <Router>
//    <AppLayout>
//      <AppRoutes />
//    </AppLayout>
//  </Router>
//);
//
//export default App;
