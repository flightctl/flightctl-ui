import * as React from 'react';
import OrganizationGuard, {
  useOrganizationGuardContext,
} from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import OrganizationSelector from '@flightctl/ui-components/src/components/common/OrganizationSelector';
import PageNavigation from '@flightctl/ui-components/src/components/common/PageNavigation';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';
import { PermissionsContextProvider } from '@flightctl/ui-components/src/components/common/PermissionsContext';
import { FLIGHTCTL_APP_CLASS } from '@flightctl/ui-components/src/constants';

// Adds the "fctl-app" class to the root element to apply global styles.
// Sets "display: contents" to avoid the extra div from affecting the page layout (for example, in small wizard pages).
const WithPageLayoutRoot = ({ children }: React.PropsWithChildren) => (
  <div className={FLIGHTCTL_APP_CLASS} style={{ display: 'contents' }}>
    {children}
  </div>
);

const WithPageLayoutContent = ({ children }: React.PropsWithChildren) => {
  const { mustShowOrganizationSelector } = useOrganizationGuardContext();

  if (mustShowOrganizationSelector) {
    return (
      <WithPageLayoutRoot>
        <OrganizationSelector isFirstLogin />
      </WithPageLayoutRoot>
    );
  }

  return (
    <WithPageLayoutRoot>
      <PageNavigation showSettings={false} />
      {children}
    </WithPageLayoutRoot>
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
