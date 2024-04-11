import LabelsView from '@app/components/common/LabelsView';
import { getDateDisplay } from '@app/utils/dates';
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
  Spinner,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';

import RepositorySourceList from '../RepositorySourceList';
import { Fleet } from '@types';
import { getRepositorySources } from '@app/utils/fleets';
import FleetOwnerLink from '@app/components/Fleet/FleetDetails/FleetOwnerLink';
import FleetStatus from '../FleetStatus';
import { useTranslation } from 'react-i18next';

const FleetDevices = ({ fleetId, count }: { fleetId: string; count: number | undefined }) => {
  if (count === undefined) {
    return <Spinner size="sm" />;
  }
  if (count === 0) {
    return <>0</>;
  }
  return <Link to={`/devicemanagement/devices?fleetId=${fleetId}`}>{count}</Link>;
};

const FleetDetailsContent = ({ fleet, devicesCount }: { fleet: Fleet; devicesCount: number | undefined }) => {
  const { t } = useTranslation();
  const repositorySources = getRepositorySources(fleet);
  return (
    <Grid hasGutter>
      <GridItem md={12}>
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
              <DescriptionListGroup>
                <DescriptionListTerm>{t('OS image')}</DescriptionListTerm>
                <DescriptionListDescription>{fleet.spec.template.spec.os?.image}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Label selector')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <LabelsView prefix="device" labels={fleet.spec.selector?.matchLabels} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Associated devices')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetDevices fleetId={fleet.metadata.name as string} count={devicesCount} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Managed by')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetOwnerLink owner={fleet.metadata.owner} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Sources ({{size}})', { size: repositorySources.length })}</DescriptionListTerm>
                <DescriptionListDescription>
                  <RepositorySourceList repositorySources={repositorySources} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default FleetDetailsContent;
