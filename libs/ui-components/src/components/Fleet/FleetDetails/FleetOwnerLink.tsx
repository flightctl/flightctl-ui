import * as React from 'react';
import { CodeBranchIcon } from '@patternfly/react-icons/dist/js/icons/code-branch-icon';

import { ResourceKind } from '@flightctl/types';
import { Link, ROUTE } from '../../../hooks/useNavigate';
import { useTranslation } from '../../../hooks/useTranslation';
import WithTooltip from '../../common/WithTooltip';
import { getOwnerName } from '../../../utils/resource';

export const RSLink = ({ rsName }: { rsName: string }) => (
  <div>
    <CodeBranchIcon /> <Link to={{ route: ROUTE.RESOURCE_SYNC_DETAILS, postfix: rsName }}>{rsName}</Link>
  </div>
);

const FleetOwnerLink = ({ owner }: { owner: string | undefined }) => {
  const ownerRsName = getOwnerName(ResourceKind.RESOURCE_SYNC, owner);
  if (!ownerRsName) {
    return '-';
  }

  return <RSLink rsName={ownerRsName} />;
};

export const FleetOwnerLinkIcon = ({
  ownerName,
  children,
}: React.PropsWithChildren<{
  ownerName: string | undefined;
}>) => {
  const { t } = useTranslation();
  if (!ownerName) {
    return children;
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      <WithTooltip
        content={t('Managed by the resource sync {{resourceSyncName}}', { resourceSyncName: ownerName })}
        showTooltip
      >
        <CodeBranchIcon />
      </WithTooltip>
      &nbsp;
      {children}
    </span>
  );
};

export default FleetOwnerLink;
