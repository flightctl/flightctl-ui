import * as React from 'react';
import OrganizationGuard from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';
import { PermissionsContextProvider } from '@flightctl/ui-components/src/components/common/PermissionsContext';

const WithPageLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <OrganizationGuard>
      <PermissionsContextProvider>
        <SystemRestoreProvider>
          <>{children}</>
        </SystemRestoreProvider>
      </PermissionsContextProvider>
    </OrganizationGuard>
  );
};

export default WithPageLayout;
