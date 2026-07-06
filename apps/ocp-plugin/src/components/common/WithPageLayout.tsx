import * as React from 'react';
import OrganizationGuard, {
  useOrganizationGuardContext,
} from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import OrganizationSelector from '@flightctl/ui-components/src/components/common/OrganizationSelector';
import PageNavigation from '@flightctl/ui-components/src/components/common/PageNavigation';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';
import { PermissionsContextProvider } from '@flightctl/ui-components/src/components/common/PermissionsContext';

const WithPageLayoutContent = ({ children }: React.PropsWithChildren) => {
  const { mustShowOrganizationSelector } = useOrganizationGuardContext();

  if (mustShowOrganizationSelector) {
    return <OrganizationSelector isFirstLogin />;
  }

  return (
    <>
      <PageNavigation showSettings={false} />
      {children}
    </>
  );
};

const WithPageLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <OrganizationGuard>
      <PermissionsContextProvider>
        <SystemRestoreProvider>
          <WithPageLayoutContent>{children}</WithPageLayoutContent>
        </SystemRestoreProvider>
      </PermissionsContextProvider>
    </OrganizationGuard>
  );
};

export default WithPageLayout;
