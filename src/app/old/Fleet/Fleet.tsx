import React, { useState } from 'react';
import { fetchDataObj } from '@app/old/utils/commonFunctions';
import { device } from '@app/old/utils/commonDataTypes';
import YAML from 'yaml';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  Breadcrumb,
  BreadcrumbItem,
  CodeBlock,
  CodeBlockCode,
  Button,
  Divider,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Panel,
  PanelMain,
  PanelMainBody,
  PanelHeader,
  SearchInput,
  Tabs,
  Tab,
  TabTitleText,
  TextInput,
  Title,
  Card,
  CardTitle,
  CardBody,
  CardFooter,
} from '@patternfly/react-core';
import { Chart, ChartAxis, ChartBar, ChartGroup, ChartThemeColor, ChartTooltip } from '@patternfly/react-charts';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import { useAuth } from '@app/hooks/useAuth';
const dateFormatter = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  let dateObj;
  const epoch = Number(date);
  if (epoch) {
    dateObj = new Date(epoch * 1000);
  } else {
    dateObj = new Date(date);
  }

  return `${dateObj.toLocaleDateString('en-US', options)} ${dateObj.toLocaleTimeString('en-US')}`;
};
const windowPath = window.location.pathname.split('fleet/');
const fleetID = windowPath[1];
var fleet = new YAML.Document();

const Fleet: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [fleetData, setFleetData] = React.useState<device>();
  const auth = useAuth();
  function getEvents() {
    setIsLoading(true);
    if (fleetID != null) {
      fetchDataObj('fleets', fleetID, auth?.user?.access_token ?? '').then((data) => {
        fleet.contents = data;
        setFleetData(data);
        setIsLoading(false);
      });
    } else {
      console.log('fleetID is null');
    }
  }

  // I want to set label to time, datanum.x * 10 is the time in minutes negatives are in the past,
  // if datunum.x * 10 is like 120, convert it to 2h 0m for example
  const label = ({ datum }: any) => {
    const x = datum.x;
    const time = datum.x * -10;
    const hours = Math.floor(time / 60);
    // set time to be positive
    const minutes = time % 60;
    return `${datum.name}: ${hours}h ${minutes}m`;
  };
  //

  React.useEffect(() => {
    setIsLoading(true);
    getEvents();
  }, [auth]);
  return (
    <PageSection>
      <Breadcrumb>
        <BreadcrumbItem to="/fleets">Fleets</BreadcrumbItem>
        <BreadcrumbItem to="#" isActive>
          {fleetID}
        </BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1" size="3xl">
        {fleetID}
      </Title>
      <Card style={{ width: '50%', background: '#f0f0f0' }}>
        <CardTitle>Details</CardTitle>
        <CardBody>
          <Divider />
          <table>
            <thead>
              <tr>
                <th style={{ padding: '0 20px' }}>
                  <b>Created</b>
                </th>
                <th style={{ padding: '0 20px' }}>
                  <b>Created by</b>
                </th>
                <th style={{ padding: '0 20px' }}>
                  <b>Status</b>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0 20px' }}>{dateFormatter(fleetData?.metadata.creationTimestamp)}</td>
                <td style={{ padding: '0 20px' }}>{auth?.user?.profile.preferred_username}</td>
                <td style={{ padding: '0 20px' }}>Syncing</td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { Fleet };
