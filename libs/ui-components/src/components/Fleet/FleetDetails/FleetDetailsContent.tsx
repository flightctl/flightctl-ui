import * as React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import { type Fleet, ResourceKind } from '@flightctl/types';
import LabelsView from '../../common/LabelsView';
import { getDateDisplay } from '../../../utils/dates';
import { getFleetRolloutStatusWarning } from '../../../utils/status/fleet';
import { useTranslation } from '../../../hooks/useTranslation';
import { useVulnerabilitiesEnabled } from '../../../hooks/useServicesEnabled';
import { RepositorySourcePlainList } from '../../Repository/RepositoryDetails/RepositorySourceList';
import ConfigurationSourcesHeader from '../../Repository/RepositoryDetails/ConfigurationSourcesHeader';
import FleetOwnerLink from './FleetOwnerLink';
import FleetDevicesCharts from './FleetDevicesCharts';
import FleetStatus from '../FleetStatus';
import FleetDevicesCount from './FleetDevicesCount';
import EventsCard from '../../Events/EventsCard';
import FleetVulnerabilities from './FleetVulnerabilities';
import FleetDetailsOsMode from './FleetDetailsOsMode';
import SystemImage from '../../Device/EditDeviceWizard/SystemImageDescriptionGroup';

const FleetDetailsContent = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();

  const [vulnerabilitiesEnabled, canListVulnerabilities] = useVulnerabilitiesEnabled();
  const showVulnerabilities = vulnerabilitiesEnabled && canListVulnerabilities;

  const fleetId = fleet.metadata.name as string;
  const devicesSummary = fleet.status?.devicesSummary;
  const osModeCounts = devicesSummary?.capabilities?.osMode;

  const fleetConfig = fleet.spec.template.spec.config || [];
  const fleetConfigCount = fleetConfig.length;

  return (
    <Grid hasGutter>
      <GridItem md={9}>
        <Card>
          <CardTitle>{t('Details')}</CardTitle>
          <CardBody>
            <DescriptionList columnModifier={{ lg: '3Col' }}>
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
              <SystemImage osSpec={fleet.spec.template.spec.os} isFleet={true} />
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Device selector')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <LabelsView prefix="device" labels={fleet.spec.selector?.matchLabels} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Up-to-date/devices')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetDevicesCount
                    fleetId={fleetId}
                    devicesSummary={devicesSummary}
                    error={getFleetRolloutStatusWarning(fleet, t)}
                  />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Managed by')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetOwnerLink owner={fleet.metadata.owner} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              {osModeCounts && devicesSummary?.total > 0 ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('OS mode')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <FleetDetailsOsMode osModeCounts={osModeCounts} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}

              <DescriptionListGroup>
                <DescriptionListTerm>
                  <ConfigurationSourcesHeader count={fleetConfigCount} />
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <RepositorySourcePlainList configs={fleetConfig} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>

        {showVulnerabilities && (
          <div className="pf-v6-u-mt-md">
            <FleetVulnerabilities fleetId={fleetId} />
          </div>
        )}

        {devicesSummary && (
          <Card className="pf-v6-u-mt-md">
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
