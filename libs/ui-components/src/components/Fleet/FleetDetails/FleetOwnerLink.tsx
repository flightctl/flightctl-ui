import * as React from 'react';
import { Label } from '@patternfly/react-core';
import { CodeBranchIcon } from '@patternfly/react-icons/dist/js/icons/code-branch-icon';
import { Link, ROUTE } from '../../../hooks/useNavigate';

const rsOwnerRegex = /^ResourceSync\/(?<rsName>.*)$/;

export const getOwnerName = (owner: string | undefined) => rsOwnerRegex.exec(owner || '')?.groups?.rsName;

export const RSLink = ({ rsName }: { rsName: string }) => (
  <div>
    <Label color="green">RS</Label> <Link to={{ route: ROUTE.RESOURCE_SYNC_DETAILS, postfix: rsName }}>{rsName}</Link>
  </div>
);

const FleetOwnerLink = ({ owner }: { owner: string | undefined }) => {
  const ownerRsName = getOwnerName(owner);
  if (!ownerRsName) {
    return '-';
  }

  return <RSLink rsName={ownerRsName} />;
};

export const FleetOwnerLinkIcon = ({ hasOwner, children }: { hasOwner: boolean; children: React.ReactNode }) => {
  if (!hasOwner) {
    return children;
  }

  return (
    <>
      <CodeBranchIcon /> {children}
    </>
  );
};

export default FleetOwnerLink;
