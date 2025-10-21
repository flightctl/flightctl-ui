import * as React from 'react';
import OrganizationGuard from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import PageNavigation from '@flightctl/ui-components/src/components/common/PageNavigation';
import { AuthType } from '@flightctl/ui-components/src/types/extraTypes';

// Restore WithPageLayoutContent when organizations are enabled for OCP plugin
// The context is still needed since "useOrganizationGuardContext" is used in common components
const WithPageLayoutContent = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <PageNavigation authType={AuthType.K8S} />
      {children}
    </>
  );
};

const WithPageLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <OrganizationGuard>
      <WithPageLayoutContent>{children}</WithPageLayoutContent>
    </OrganizationGuard>
  );
};

export default WithPageLayout;
