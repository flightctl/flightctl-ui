import * as React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import { Fleet, ResourceKind } from '@flightctl/types';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import LabelsView from '../../common/LabelsView';
import { getDateDisplay } from '../../../utils/dates';
import { getFleetRolloutStatusWarning } from '../../../utils/status/fleet';
import { useTranslation } from '../../../hooks/useTranslation';
import RepositorySourceList from '../../Repository/RepositoryDetails/RepositorySourceList';
import FleetOwnerLink from './FleetOwnerLink';
import FleetDevicesCharts from './FleetDevicesCharts';
import FleetStatus from '../FleetStatus';
import FleetDevicesCount from './FleetDevicesCount';
import EventsCard from '../../Events/EventsCard';

const FleetDetailsContent = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const fleetId = fleet.metadata.name as string;
  const devicesSummary = fleet.status?.devicesSummary;
  const rolloutError = getFleetRolloutStatusWarning(fleet, t);

  return (
    <Grid hasGutter>
      <GridItem md={9}>
        <Card>
          <CardTitle>{t('Details')}</CardTitle>
          <CardBody>
            <FlightControlDescriptionList columnModifier={{ lg: '3Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {getDateDisplay(fleet.metadata.creationTimestamp || '')}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetStatus fleet={fleet} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('System image')}</DescriptionListTerm>
                <DescriptionListDescription>{fleet.spec.template.spec.os?.image || '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Device selector')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <LabelsView prefix="device" labels={fleet.spec.selector?.matchLabels} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Up-to-date/devices')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetDevicesCount fleetId={fleetId} devicesSummary={devicesSummary} error={rolloutError} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Managed by')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetOwnerLink owner={fleet.metadata.owner} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {t('Sources ({{size}})', { size: fleet.spec.template.spec.config?.length || 0 })}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <RepositorySourceList configs={fleet.spec.template.spec.config || []} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </FlightControlDescriptionList>
          </CardBody>
        </Card>
        {devicesSummary && (
          <Card className="pf-v5-u-mt-md">
            <CardTitle>{t('Fleet devices')}</CardTitle>
            <CardBody>
              <FleetDevicesCharts fleetId={fleetId} devicesSummary={devicesSummary} />
            </CardBody>
          </Card>
        )}
      </GridItem>
      <GridItem md={3}>
        <EventsCard kind={ResourceKind.FLEET} objId={fleetId} />
      </GridItem>
    </Grid>
  );
};

export default FleetDetailsContent;
