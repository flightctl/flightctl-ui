import React, { useState, useEffect } from 'react';
import { fetchData } from '@app/utils/commonFunctions';
import { useAuth } from 'react-oidc-context';
import {
  Card,
  CardBody,
  Breadcrumb, 
  BreadcrumbItem,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  Divider,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  PageSection,
  Title,
  CardHeader,
} from '@patternfly/react-core';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import YAML from 'yaml';
import { CubeIcon } from '@patternfly/react-icons';
import { bottom } from '@patternfly/react-core/dist/esm/helpers/Popper/thirdparty/popper-core';
let chart: JSX.Element[] = [];
const Experimental2: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const auth = useAuth();

  function getDevices() {
    // set svg "chart" empty
    
    if (auth.user?.access_token) {

      fetchData("devices", auth.user?.access_token).then((datad) => {
        console.log("hola");
        /*
        data = {"apiVersion":"v1alpha1","items":[{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:50:53Z","name":"8fef85736b9b2462e8f4f258030544429305ab0fd7ae5591f3afe467e3ff081f"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:05Z","name":"686d7f89b3767d121fb2b1c5c6c2fbd9da86aefd70591cbed3e00af98f4391cd"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:07Z","name":"87f0bfee4d9be24d3f5b9e004c49ad58a6ba06e647e86748092134fcfec67d76"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:14Z","name":"700925fb021b534018cd8749b2656cae7eba6d87aa6dda1cec093a055a38e16c"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:22Z","name":"c18d0582c13f3890f5b2de6733feede3665e8f7570539a74a63b784b91e9483f"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:26Z","name":"5571d36e302d014c8cef703f2d070a529efe6d06c98633b0779794b7a1e7b7de"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:42Z","name":"0e7c323d0390a68450d456f6df9aa83fc2ed70ba3d0083ed9d9238d03769ed47"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:43Z","name":"c03f5b14be069e3268bec6355b78aa63831f3ccda806624f24558ea0ba87de9e"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:44Z","name":"2e2086871c0352bb3d99edb9968ae4c2342bc2405d67c16e5fd0fba4d8a33a28"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:44Z","name":"3c5bb8b9d6f0281e036e41216c1fc7e4039ad2cd1abafb35fe196f186a75918c"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}}],"kind":"DeviceList","metadata":{}};
    
        */
        let devices = datad.items;
        // deja devices con 10 de muestra
        
        const fleets = [
          "solarpannels",
          "batteries",
          "engines",
          "amplifiers",
          "sensors"
        ]

        const regions = [
          "eu-west-1",
          "us-west-1",
          "us-west-2"
        ]

        /*
        actualiza devices con los datos de los devices y una fleet y region random en datos válidos para el gráfico d3
        */
        
        let i = 0;
        let j = 0;
        chart = [];
        let line: JSX.Element[] = [];
        devices.forEach((device: any) => {
          device.fleet = fleets[Math.floor(Math.random() * fleets.length)];
          if (Math.random() < 0.96) {
            device.color = "green";
          } else {
            device.color = "red";
          }
          device.region = regions[Math.floor(Math.random() * regions.length)];
          // convert device to YAML
          device.yaml = YAML.stringify(device);
          line.push(<CubeIcon style={{paddingRight: '0px', opacity: device.color === "green" ? 0.5 : 1}} color={device.color} />);
          i++;
          if (i % 30 === 0) {
            chart.push(<div style={{display: 'flex', flexWrap: 'wrap', gap: '1px', marginLeft: j % 2 === 0 ? '0px' : '8px', marginTop: j > 0 ? '-3px' : '0px'}}>{line}</div>);
            line = [];
            j++;
          }
        });

      });
      
    }
  }

  getDevices();



  React.useEffect(() => {
    setIsLoading(true);
    getDevices();
    const interval = setInterval(() => {
      getDevices();
    }, 10000);
    return () => clearInterval(interval);
  }, [auth]);
  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Experimental 2</Title>

      <Card>
        <CardHeader>
        <Breadcrumb>
        <BreadcrumbItem>All devices</BreadcrumbItem>
        <BreadcrumbItem>Fleet: Solarpannels</BreadcrumbItem>
        <BreadcrumbItem>Region: eu-west-1</BreadcrumbItem>
        <BreadcrumbItem isActive>Devices</BreadcrumbItem>
      </Breadcrumb>
        </CardHeader>
        <CardBody>
        {chart}
        </CardBody>
      </Card>
    </PageSection>
  )
};

export { Experimental2 };

