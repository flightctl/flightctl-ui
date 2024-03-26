import * as React from 'react';
import { Link } from 'react-router-dom';
import { Label } from '@patternfly/react-core';

const rsOwnerRegex = /^ResourceSync\/(?<rsName>.*)$/;

export const RSLink = ({ rsName }: { rsName: string }) => (
  <div>
    <Label color="green">RS</Label> <Link to={`/devicemanagement/resourcesyncs/${rsName}`}>{rsName}</Link>
  </div>
);

const FleetOwnerLink = ({ owner }: { owner: string | undefined }) => {
  const ownerRsName = rsOwnerRegex.exec(owner || '')?.groups?.rsName;
  if (!ownerRsName) {
    return '-';
  }

  return <RSLink rsName={ownerRsName} />;
};

export default FleetOwnerLink;
