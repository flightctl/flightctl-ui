import LabelsView from '../../common/LabelsView';
import { getDateDisplay } from '../../../utils/dates';
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

import { Fleet } from '@flightctl/types';
import FleetOwnerLink from './FleetOwnerLink';
import FleetDevices from './FleetDevices';
import FleetStatus from '../FleetStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../hooks/useNavigate';
import RepositorySourceList from '../../Repository/RepositoryDetails/RepositorySourceList';
import { getSourceItems } from '../../../utils/devices';

const FleetDevicesLink = ({ fleetId, count }: { fleetId: string; count: number | undefined }) => {
  if (count === undefined) {
    return <Spinner size="sm" />;
  }
  if (count === 0) {
    return <>0</>;
  }
  return (
    <Link to={ROUTE.DEVICES} query={`fleetId=${fleetId}`}>
      {count}
    </Link>
  );
};

const FleetDetailsContent = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const sourceItems = getSourceItems(fleet.spec.template.spec.config);
  const fleetId = fleet.metadata.name as string;
  const devicesSummary = fleet.status?.devicesSummary;
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
                  <FleetDevicesLink fleetId={fleetId} count={devicesSummary?.total || 0} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Managed by')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <FleetOwnerLink owner={fleet.metadata.owner} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Sources ({{size}})', { size: sourceItems.length })}</DescriptionListTerm>
                <DescriptionListDescription>
                  <RepositorySourceList sourceItems={sourceItems} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
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
