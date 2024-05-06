import * as React from 'react';
import { Button, List, ListItem, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { ObjectMeta } from '@flightctl/types';
import { getDeviceFleet, getMissingFleetDetails } from '../../../utils/devices';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppContext } from '../../../hooks/useAppContext';

import './DeviceFleet.css';

const FleetLessDevice = ({ deviceMetadata }: { deviceMetadata: ObjectMeta }) => {
  const {
    router: { Link },
  } = useAppContext();
  const { t } = useTranslation();
  const details = getMissingFleetDetails(t, deviceMetadata);
  const hasMultipleOwners = details.owners.length > 1;

  return (
    <div className="fctl-device-fleet">
      {hasMultipleOwners ? t('Multiple owners') : t('No owner fleet')}
      <Popover
        triggerAction="hover"
        aria-label={t('Missing fleeet detail')}
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
  const {
    router: { Link },
  } = useAppContext();
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
