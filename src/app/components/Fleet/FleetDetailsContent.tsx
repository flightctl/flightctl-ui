import React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DropdownList,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { CheckCircleIcon, InProgressIcon, QuestionCircleIcon } from '@patternfly/react-icons';

import { Fleet, FleetStatus } from '@types';
import { getDateDisplay } from '@app/utils/dates';
import { getSourceUrls } from '@app/utils/fleets';
import { getFleetStatusType } from '@app/utils/status/fleet';

import { DevicesDonuts } from '@app/old/Overview/devicesDonuts';
import EventList from '@app/components/common/EventList';
import LabelsView from '@app/components/common/LabelsView';
import FleetServiceStatus from '@app/components/Metrics/FleetServiceStatus';
import FleetDevicesTab from './FleetDevicesTab';
import { UserPreferencesContext } from '@app/components/UserPreferences/UserPreferencesProvider';

import SourceUrlList from './SourceUrlList';
import DetailsPageActions, { useDeleteAction } from '../DetailsPage/DetailsPageActions';
import { useFetch } from '@app/hooks/useFetch';
import { useNavigate } from 'react-router-dom';

const fakeDevicesStatus = {
  Ready: { count: 720 },
  Error: { count: 50 },
  Syncing: { count: 80 },
  Offline: { count: 90 },
  Degraded: { count: 60 },
};

const FleetStatus = ({ status }: { status: FleetStatus }) => {
  const statusType = getFleetStatusType(status);
  let color;
  let icon;

  switch (statusType) {
    case 'Syncing':
      color = 'orange';
      icon = <InProgressIcon />;
      break;
    case 'Synced':
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    default:
      color = 'grey';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <Label color={color} icon={icon}>
      {statusType}
    </Label>
  );
};

const FleetDetailsContent = ({ fleet }: { fleet: Required<Fleet> }) => {
  const { experimentalFeatures } = React.useContext(UserPreferencesContext);

  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);
  const [deviceCount, setDeviceCount] = React.useState<number>();

  const { remove } = useFetch();
  const navigate = useNavigate();
  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`fleets/${fleet.metadata.name}`);
      navigate('/devicemanagement/fleets');
    },
    resourceName: fleet.metadata.name!,
    resourceType: 'Fleet',
  });

  const handleTabClick = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, tabIndex: string | number) => {
    setActiveTabKey(Number(tabIndex));
  };

  const sourceUrls = getSourceUrls(fleet);
  return (
    <Stack hasGutter>
      <StackItem>
        <DetailsPageActions>
          <DropdownList>{deleteAction}</DropdownList>
        </DetailsPageActions>
      </StackItem>
      <StackItem>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Fleet details tabs" role="region">
          <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Fleet details">
            <Card>
              <CardTitle>Details</CardTitle>
              <CardBody>
                <Grid hasGutter>
                  <GridItem md={experimentalFeatures ? 6 : 12}>
                    <DescriptionList columnModifier={{ lg: '3Col' }}>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created</DescriptionListTerm>
                        <DescriptionListDescription>
                          {getDateDisplay(fleet.metadata.creationTimestamp || '')}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>OS image</DescriptionListTerm>
                        <DescriptionListDescription>{fleet.spec.template.spec.os?.image}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Label selector</DescriptionListTerm>
                        <DescriptionListDescription>
                          <LabelsView labels={fleet.spec.selector?.matchLabels} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      {experimentalFeatures && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Created by</DescriptionListTerm>
                          <DescriptionListDescription>user unknown</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}

                      <DescriptionListGroup>
                        <DescriptionListTerm>Status</DescriptionListTerm>
                        <DescriptionListDescription>
                          <FleetStatus status={fleet.status} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      {experimentalFeatures && (
                        <>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Fail threshold</DescriptionListTerm>
                            <DescriptionListDescription>20% of batch (m)</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Batch size</DescriptionListTerm>
                            <DescriptionListDescription>10% (m)</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Maintenance window</DescriptionListTerm>
                            <DescriptionListDescription>--</DescriptionListDescription>
                          </DescriptionListGroup>
                        </>
                      )}
                      <DescriptionListGroup>
                        <DescriptionListTerm>Sources</DescriptionListTerm>
                        <DescriptionListDescription>
                          <SourceUrlList sourceUrls={sourceUrls} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </GridItem>
                  {experimentalFeatures && (
                    <>
                      <GridItem md={6}>
                        <Card>
                          <CardTitle>Service status (m)</CardTitle>
                          <CardBody>
                            <FleetServiceStatus />
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem md={6}>
                        <Card>
                          <CardTitle>Events (m)</CardTitle>
                          <CardBody>
                            <EventList />
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem md={6}>
                        <Card>
                          <CardTitle>Update status (m)</CardTitle>
                          <CardBody>
                            <DevicesDonuts fleetDevicesStatus={fakeDevicesStatus} totalDevices={1000}></DevicesDonuts>
                          </CardBody>
                        </Card>
                      </GridItem>
                    </>
                  )}
                </Grid>
              </CardBody>
            </Card>
          </Tab>
          <Tab
            eventKey={1}
            title={<TabTitleText>Devices ({deviceCount === undefined ? '-' : deviceCount})</TabTitleText>}
            aria-label="Fleet devices"
          >
            <FleetDevicesTab fleetName={fleet.metadata.name as string} onDevicesLoaded={setDeviceCount} />
          </Tab>
        </Tabs>
      </StackItem>
      {deleteModal}
    </Stack>
  );
};

export default FleetDetailsContent;
