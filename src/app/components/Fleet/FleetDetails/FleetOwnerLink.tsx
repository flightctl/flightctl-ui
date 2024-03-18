import * as React from 'react';
import { Link } from 'react-router-dom';
import { Label } from '@patternfly/react-core';

const rsOwnerRegex = /^ResourceSync\/(?<rsName>.*)$/;

const FleetOwnerLink = ({ owner }: { owner: string | undefined }) => {
  const ownerRsName = rsOwnerRegex.exec(owner || '')?.groups?.rsName;
  if (!ownerRsName) {
    return '-';
  }

  return (
    <div>
      <Label color="green">RS</Label> <Link to={`/devicemanagement/resourcesyncs/${ownerRsName}`}>{ownerRsName}</Link>
    </div>
  );
};

export default FleetOwnerLink;
