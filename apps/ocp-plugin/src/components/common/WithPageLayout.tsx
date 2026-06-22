import * as React from 'react';
import OrganizationGuard, {
  useOrganizationGuardContext,
} from '@flightctl/ui-components/src/components/common/OrganizationGuard';
import OrganizationSelector from '@flightctl/ui-components/src/components/common/OrganizationSelector';
import PageNavigation from '@flightctl/ui-components/src/components/common/PageNavigation';
import { SystemRestoreProvider } from '@flightctl/ui-components/src/hooks/useSystemRestoreContext';
import { PermissionsContextProvider } from '@flightctl/ui-components/src/components/common/PermissionsContext';

// The OCP console uses "calc" to calculate padding values for page containers and breadcrumbs.
// But some CSS variables it uses are undefined, so the "calc" values are invalid.
const ocpPageRootStyles: React.CSSProperties = {
  // Ensure page containers have inline padding
  ['--pf-v6-c-page__main-container--BorderInlineEndWidth' as string]: '0px',
  ['--pf-v6-c-page__main-container--BorderInlineStartWidth' as string]: '0px',
  // Ensure page breadcrumbs have inline padding
  ['--pf-v6-c-page__main-breadcrumb--PaddingInlineStart' as string]: '1rem',
  ['--pf-v6-c-page__main-breadcrumb--PaddingInlineEnd' as string]: '1rem',
};

const WithPageLayoutContent = ({ children }: React.PropsWithChildren) => {
  const { mustShowOrganizationSelector } = useOrganizationGuardContext();

  if (mustShowOrganizationSelector) {
    return <OrganizationSelector isFirstLogin />;
  }

  return (
    <div style={ocpPageRootStyles}>
      <PageNavigation showSettings={false} />
      {children}
    </div>
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
