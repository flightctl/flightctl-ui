import * as React from 'react';
import OrganizationGuard from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';

const WithPageLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <OrganizationGuard>
      <SystemRestoreProvider>
        <>{children}</>
      </SystemRestoreProvider>
    </OrganizationGuard>
  );
};

export default WithPageLayout;
