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

import { Fleet } from '@flightctl/types';
import FleetOwnerLink from './FleetOwnerLink';
import FleetDevices from './FleetDevices';
import FleetStatus from '../FleetStatus';
import FleetDevicesLink from './FleetDevicesLink';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import LabelsView from '../../common/LabelsView';
import { getDateDisplay } from '../../../utils/dates';
import { useTranslation } from '../../../hooks/useTranslation';
import RepositorySourceList from '../../Repository/RepositoryDetails/RepositorySourceList';

const FleetDetailsContent = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const fleetId = fleet.metadata.name as string;
  const devicesSummary = fleet.status?.devicesSummary;
  return (
    <Grid hasGutter>
      <GridItem md={12}>
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
                <DescriptionListTerm>{t('Associated devices')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetDevicesLink fleetId={fleetId} count={devicesSummary?.total} />
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
      </GridItem>
      {devicesSummary && (
        <GridItem md={12}>
          <Card>
            <CardTitle>{t('Fleet devices')}</CardTitle>

            <CardBody>
              <FleetDevices fleetId={fleetId} devicesSummary={devicesSummary} />
            </CardBody>
          </Card>
        </GridItem>
      )}
    </Grid>
  );
};

export default FleetDetailsContent;
