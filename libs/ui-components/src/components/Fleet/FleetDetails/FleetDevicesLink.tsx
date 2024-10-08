import React from 'react';

import { Link, ROUTE } from '../../../hooks/useNavigate';

const FleetDevicesLink = ({ fleetId, count }: { fleetId: string; count: number | undefined }) => {
  if (!count) {
    return <>0</>;
  }
  return (
    <Link to={ROUTE.DEVICES} query={`fleetId=${fleetId}`}>
      {count}
    </Link>
  );
};

export default FleetDevicesLink;
