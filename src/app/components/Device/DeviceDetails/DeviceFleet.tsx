import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, List, ListItem, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { ObjectMeta } from '@types';
import { getDeviceFleet, getMissingFleetDetails } from '@app/utils/devices';

import './DeviceFleet.css';

const MissingFleetContent = ({ detail }: { detail: { message: string; owners: string[] } }) => {
  return (
    <span>
      {detail.message}
      {detail.owners.length > 0 && (
        <span>
          {': '}
          <List>
            {detail.owners.map((ownerFleet) => {
              return (
                <ListItem key={ownerFleet}>
                  <Link to={`/devicemanagement/fleets/${ownerFleet}`}>{ownerFleet}</Link>
                </ListItem>
              );
            })}
          </List>
        </span>
      )}
    </span>
  );
};

const DeviceFleet = ({ deviceMetadata }: { deviceMetadata: ObjectMeta }) => {
  const fleetName = getDeviceFleet(deviceMetadata);

  return (
    <div>
      {fleetName ? (
        <Link to={`/devicemanagement/fleets/${fleetName}`}>{fleetName}</Link>
      ) : (
        <div className="fctl-device-fleet">
          No owner fleet
          <Popover
            triggerAction="hover"
            aria-label="Missing fleeet detail"
            bodyContent={<MissingFleetContent detail={getMissingFleetDetails(deviceMetadata)} />}
          >
            <Button isInline variant="plain" icon={<InfoCircleIcon />} />
          </Popover>
        </div>
      )}
    </div>
  );
};

export default DeviceFleet;
