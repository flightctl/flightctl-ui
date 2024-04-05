import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, List, ListItem, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { ObjectMeta } from '@types';
import { getDeviceFleet, getMissingFleetDetails } from '@app/utils/devices';

import './DeviceFleet.css';

const FleetLessDevice = ({ deviceMetadata }: { deviceMetadata: ObjectMeta }) => {
  const details = getMissingFleetDetails(deviceMetadata);
  const hasMultipleOwners = details.owners.length > 1;

  return (
    <div className="fctl-device-fleet">
      {hasMultipleOwners ? 'Multiple owners' : 'No owner fleet'}
      <Popover
        triggerAction="hover"
        aria-label="Missing fleeet detail"
        bodyContent={
          <span>
            {details.message}
            {hasMultipleOwners && (
              <span>
                {': '}
                <List>
                  {details.owners.map((ownerFleet) => {
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
        }
      >
        <Button isInline variant="plain" icon={<InfoCircleIcon />} />
      </Popover>
    </div>
  );
};

const DeviceFleet = ({ deviceMetadata }: { deviceMetadata: ObjectMeta }) => {
  const fleetName = getDeviceFleet(deviceMetadata);

  return (
    <div>
      {fleetName ? (
        <Link to={`/devicemanagement/fleets/${fleetName}`}>{fleetName}</Link>
      ) : (
        <FleetLessDevice deviceMetadata={deviceMetadata} />
      )}
    </div>
  );
};

export default DeviceFleet;
