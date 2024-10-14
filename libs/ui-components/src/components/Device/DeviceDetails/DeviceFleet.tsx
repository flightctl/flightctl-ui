import * as React from 'react';
import { Button, List, ListItem, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import { Condition, ConditionType, Device } from '@flightctl/types';
import { getDeviceFleet } from '../../../utils/devices';
import { getCondition } from '../../../utils/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../hooks/useNavigate';

import './DeviceFleet.css';

const FleetLessDevice = ({ multipleOwnersCondition }: { multipleOwnersCondition?: Condition }) => {
  const { t } = useTranslation();

  let message = '';
  let owners: string[] = [];
  if (multipleOwnersCondition) {
    message = t('Device is owned by more than one fleet');
    owners = (multipleOwnersCondition.message || '').split(',');
  } else {
    message = t("Device labels don't match any fleet's selector labels");
  }

  const hasMultipleOwners = owners.length > 1;

  return (
    <div className="fctl-device-fleet">
      {hasMultipleOwners ? t('Multiple owners') : t('None')}
      <Popover
        bodyContent={
          <span>
            {message}
            {hasMultipleOwners && (
              <span>
                {': '}
                <List>
                  {owners.map((ownerFleet) => {
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
        <Button
          isInline
          variant="plain"
          icon={<OutlinedQuestionCircleIcon />}
          aria-label={t('Ownership information')}
        />
      </Popover>
    </div>
  );
};

const DeviceFleet = ({ device }: { device?: Device }) => {
  if (!device) {
    return '-';
  }

  const fleetName = getDeviceFleet(device.metadata);
  if (fleetName) {
    return <Link to={{ route: ROUTE.FLEET_DETAILS, postfix: fleetName }}>{fleetName}</Link>;
  }

  const multipleOwnersCondition = getCondition(device.status?.conditions, ConditionType.DeviceMultipleOwners);
  return <FleetLessDevice multipleOwnersCondition={multipleOwnersCondition} />;
};

export default DeviceFleet;
