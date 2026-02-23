import * as React from 'react';
import { Button, Icon, List, ListItem, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { ConditionType, Device } from '@flightctl/types';
import { GenericCondition } from '../../../types/extraTypes';
import { getDeviceFleet } from '../../../utils/devices';
import { getCondition } from '../../../utils/api';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../hooks/useNavigate';

import './DeviceFleet.css';

const FleetLessDevice = () => {
  const { t } = useTranslation();
  return (
    <div className="fctl-device-fleet">
      {t('None')}
      <Popover bodyContent={<span>{t("Device labels don't match any fleet's selector labels")}</span>}>
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

const MultipleDeviceOwners = ({ multipleOwnersCondition }: { multipleOwnersCondition: GenericCondition }) => {
  const { t } = useTranslation();

  const owners: string[] = (multipleOwnersCondition.message || '').split(',');

  const hasMultipleOwners = owners.length > 1;
  if (!hasMultipleOwners) {
    return null;
  }

  return (
    <Popover
      bodyContent={
        <span>
          {t('Device is owned by more than one fleet:')}
          <span>
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
        </span>
      }
    >
      <Button
        isInline
        variant="plain"
        icon={
          <Icon status="warning">
            <ExclamationTriangleIcon />
          </Icon>
        }
        aria-label={t('Ownership information')}
      />
    </Popover>
  );
};

const DeviceFleet = ({ device }: { device?: Device }) => {
  const { t } = useTranslation();
  if (!device) {
    return '-';
  }

  const multipleOwnersCondition = getCondition(device.status?.conditions, ConditionType.DeviceMultipleOwners);
  let fleetNameEl: React.ReactNode = null;
  const fleetName = getDeviceFleet(device.metadata);
  if (fleetName) {
    fleetNameEl = <Link to={{ route: ROUTE.FLEET_DETAILS, postfix: fleetName }}>{fleetName}</Link>;
  } else if (multipleOwnersCondition) {
    // Device has no owner set, but with the multiple owners condition. The warning icon should be displayed
    fleetNameEl = t('None');
  } else {
    // Valid fleetless device
    fleetNameEl = <FleetLessDevice />;
  }

  return (
    <>
      {fleetNameEl}
      {multipleOwnersCondition && <MultipleDeviceOwners multipleOwnersCondition={multipleOwnersCondition} />}
    </>
  );
};

export default DeviceFleet;
