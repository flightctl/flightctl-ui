import * as React from 'react';
import { Button, List, ListItem, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { ObjectMeta } from '@flightctl/types';
import { getDeviceFleet, getMissingFleetDetails } from '../../../utils/devices';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../hooks/useNavigate';

import './DeviceFleet.css';

const FleetLessDevice = ({ deviceMetadata }: { deviceMetadata: ObjectMeta }) => {
  const { t } = useTranslation();
  const details = getMissingFleetDetails(t, deviceMetadata);
  const hasMultipleOwners = details.owners.length > 1;

  return (
    <div className="fctl-device-fleet">
      {hasMultipleOwners ? t('Multiple owners') : t('No owner fleet')}
      <Popover
        triggerAction="hover"
        aria-label={t('Missing fleet detail')}
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
                        <Link to={{ route: ROUTE.FLEET_DETAILS, postfix: ownerFleet }}>{ownerFleet}</Link>
                      </ListItem>
                    );
                  })}
                </List>
              </span>
            )}
          </span>
        }
      >
        <Button isInline variant="plain" icon={<InfoCircleIcon />} aria-label={t('Ownership information')} />
      </Popover>
    </div>
  );
};

const DeviceFleet = ({ deviceMetadata }: { deviceMetadata: ObjectMeta }) => {
  const fleetName = getDeviceFleet(deviceMetadata);

  return (
    <div>
      {fleetName ? (
        <Link to={{ route: ROUTE.FLEET_DETAILS, postfix: fleetName }}>{fleetName}</Link>
      ) : (
        <FleetLessDevice deviceMetadata={deviceMetadata} />
      )}
    </div>
  );
};

export default DeviceFleet;
