import React, { useState } from 'react';
import { fetchDataObj } from '@app/utils/commonFunctions';
import { device } from '@app/utils/commonDataTypes';
import { useAuth } from 'react-oidc-context';
import YAML from 'yaml';
import {
    Accordion,
    AccordionItem,
    AccordionContent,
    AccordionToggle,
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
    Title
} from '@patternfly/react-core';
import { Chart, ChartAxis, ChartBar, ChartGroup, ChartThemeColor, ChartTooltip } from '@patternfly/react-charts';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
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
const windowPath = window.location.pathname.split("device/");
const deviceID = windowPath[1];
var device = new YAML.Document();



const Device: React.FunctionComponent = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [deviceData, setDeviceData] = React.useState<device>();
    const auth = useAuth();
    function getEvents() {
        setIsLoading(true);
        if (deviceID != null) {
            fetchDataObj("devices", deviceID, auth.user?.access_token ?? '').then((data) => {
                device.contents = data;
                setDeviceData(data);
                setIsLoading(false);
            });
        } else {
            console.log("deviceID is null");
        }
    }

    // I want to set label to time, datanum.x * 10 is the time in minutes negatives are in the past,
    // if datunum.x * 10 is like 120, convert it to 2h 0m for example
    const label = ({datum}: any ) => {
        const x = datum.x;
        const time = datum.x * -10;
        const hours = Math.floor(time / 60);
        // set time to be positive
        const minutes = time % 60;
        return `${datum.name}: ${hours}h ${minutes}m`;
    };
   // 
    
    
    
    //const label = ({ datum }) => `${datum.name}: ${datum.x *10}m`;

    const [expanded, setExpanded] = React.useState(['ex2-toggle1']);
    const displaySize = "lg";
    const toggle = (id) => {
        const index = expanded.indexOf(id);
        const newExpanded: string[] =
            index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, id];
        setExpanded(newExpanded);
    };
    const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
    const handleTabClick = (
        event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
        tabIndex: string | number
    ) => {
        setActiveTabKey(tabIndex);
    };


    const [isOpenFleet, setIsOpenFleet] = React.useState(false);
    const onFleetToggleClick = () => {
        setFleetList(fleetList);
        setIsOpenFleet(!isOpenFleet);
    };
    const onFleetSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
        setIsOpenFleet(false);
    };
    const fleetList = [
        { id: 0, name: 'Default', description: 'Default fleet out of the box' },
        { id: 1, name: 'Fleet 1', description: 'Fleet 1 description' },
    ];
    let [fleetListFiltered, setFleetList] = useState(fleetList);
    const cellStyle = {
        padding: '10px',
        width: '250px',
    };
    const [tableRows, setTableRows] = useState<Array<{ key: string, value: string }>>([]);

    const addNewLabel = () => {
        setTableRows(prevRows => [...prevRows, { key: '', value: '' }]);
    }
    const saveLabels = () => {
        const toggle = document.getElementById('togglefleet');
        if (toggle && toggle.innerHTML !== 'Select Fleet:') {
            tableRows.unshift({ key: 'fleet', value: toggle.innerHTML });
        }
        const labels = {};
        tableRows.forEach((row) => {
            if (row) {
                if (row.key !== '' && row.key !== 'fleet') {
                    labels[row.key] = row.value;
                } else if (tableRows.indexOf(row) === 0) {
                    labels[row.key] = row.value;
                }
            }
        });
        if (device.contents && (device.contents as any).metadata) {
            (device.contents as any).metadata.labels = labels;
            const codeContent = document.getElementById('code-content');
            if (codeContent) {
                codeContent.innerHTML = YAML.stringify(device.contents);
            }
        }

        // Send PATCH to /api/v1/devices/{deviceID}
        if (tableRows[0]) {
            if (tableRows[0].key === 'fleet') {
                tableRows.shift();
            }
        }
    }
    const [value, setValue] = React.useState('');

    const handleDeleteRow = (index) => {
        console.log("index:" + index);
        const tmpTableRows = tableRows.filter((row, i) => i !== index);
        setTableRows([]);
        setTableRows(tmpTableRows);
    };

    const durationLastContact = (lastContact) => {
        const lastContactDate = new Date(lastContact);
        const now = new Date();
        //const diff = Math.abs(now.getTime() - lastContactDate.getTime());
        const diff = Math.abs(160000);
        let syncStatus = '';
        if (diff < 10000) {
            syncStatus = 'Syncing';
        } else if (diff < 600000) {
            syncStatus = 'OK';
        } else {
            syncStatus = 'NOOK';
        }
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diff % (1000 * 60)) / 1000);
        const diffFormated = diffDays + 'd ' + diffHours + 'h ' + diffMinutes + 'm ' + diffSeconds + 's';
        let diffFormatedColor;
        if (syncStatus === 'Syncing') {
            // I want to set the color of the text to blue
            diffFormatedColor = <span style={{ color: 'blue' }}>{diffFormated} - Syncing</span>;
        } else if (syncStatus === 'OK') {
            // I want to set the color of the text to green
            diffFormatedColor = <span style={{ color: 'green' }}>{diffFormated} - OK</span>;
        } else {
            // I want to set the color of the text to red
            diffFormatedColor = <span style={{ color: 'red' }}>{diffFormated} - Out of Sync</span>;
        }
        return diffFormatedColor;
    }


    React.useEffect(() => {
        setIsLoading(true);
        getEvents();
        return auth.events.addAccessTokenExpiring(() => {
          auth.signinSilent();
        })
      }, [auth.events, auth.signinSilent]);
    return (
        <PageSection >

            <Title headingLevel="h1" size="lg">Device Details</Title>
            <Tabs
                activeKey={activeTabKey}
                onSelect={handleTabClick}
                isBox={true}
                aria-label="Tabs in the default example"
                role="region"
                style={{ padding: "10px 0px 0px 0px" }}
            >
                <Tab eventKey={0} title={<TabTitleText>Status</TabTitleText>} aria-label="Default content - Status">
                    <Accordion isBordered displaySize={displaySize}>
                        <AccordionItem>
                            <AccordionToggle
                                onClick={() => toggle('ex2-toggle1')}
                                isExpanded={expanded.includes('ex2-toggle1')}
                                id="ex2-toggle1"
                            >
                                Agent
                            </AccordionToggle>
                            <AccordionContent id="bordered-expand1" isHidden={!expanded.includes('ex2-toggle1')}>
                                <table style={{ width: "100%" }}>
                                    <thead>

                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <p>
                                                    Enroll date: {(device.contents as any)?.metadata?.creationTimestamp ? dateFormatter((device.contents as any).metadata.creationTimestamp) : ''}<br />
                                                    Next sync: 0h 07m 20s<br />
                                                    Last contact: {device.contents && (device.contents as any).metadata && (device.contents as any).metadata.creationTimestamp ? durationLastContact((device.contents as any).metadata.creationTimestamp) : ''}<br />
                                                    Last sync status: OK<br />

                                                </p>
                                            </td>

                                            <td style={{ width: "60%" }}>
                                                Last 24h status:
                                                <div style={{ height: '100px', width: '800px' }}>
                                                    <Chart
                                                        ariaDesc="Average number of pets"
                                                        ariaTitle="Bar chart example"
                                                        legendData={[{ name: 'Sync' }, { name: 'Syncing' }, { name: 'Out of Sync' }]}
                                                        legendPosition="bottom"
                                                        height={100}
                                                        width={800}
                                                        name="chart2"
                                                        showAxis={false}
                                                        padding={{
                                                            bottom: 70, // Adjusted to accommodate legend
                                                            left: 0,
                                                            right: 0,
                                                            top: 0
                                                        }}
                                                    >
                                                        <ChartAxis />
                                                        <ChartAxis />
                                                        <ChartGroup offset={1}>
                                                            <ChartBar
                                                                data={[
                                                                    { name: 'Sync', x: '-144', y: 1, label },
                                                                    { name: 'Sync', x: '-143', y: 1, label },
                                                                    { name: 'Sync', x: '-142', y: 1, label },
                                                                    { name: 'Sync', x: '-141', y: 1, label },
                                                                    { name: 'Sync', x: '-140', y: 1, label },
                                                                    { name: 'Sync', x: '-139', y: 1, label },
                                                                    { name: 'Sync', x: '-138', y: 1, label },
                                                                    { name: 'Sync', x: '-137', y: 1, label },
                                                                    { name: 'Sync', x: '-136', y: 1, label },
                                                                    { name: 'Sync', x: '-135', y: 1, label },
                                                                    { name: 'Sync', x: '-134', y: 1, label },
                                                                    { name: 'Sync', x: '-133', y: 1, label },
                                                                    { name: 'Sync', x: '-132', y: 1, label },
                                                                    { name: 'Sync', x: '-131', y: 1, label },
                                                                    { name: 'Sync', x: '-130', y: 1, label },
                                                                    { name: 'Sync', x: '-129', y: 1, label },
                                                                    { name: 'Sync', x: '-128', y: 1, label },
                                                                    { name: 'Sync', x: '-127', y: 1, label },
                                                                    { name: 'Sync', x: '-126', y: 1, label },
                                                                    { name: 'Sync', x: '-125', y: 1, label },
                                                                    { name: 'Sync', x: '-124', y: 1, label },
                                                                    { name: 'Sync', x: '-123', y: 1, label },
                                                                    { name: 'Sync', x: '-122', y: 1, label },
                                                                    { name: 'Sync', x: '-121', y: 1, label },
                                                                    { name: 'Sync', x: '-120', y: 1, label },
                                                                    { name: 'Sync', x: '-119', y: 1, label },
                                                                    { name: 'Sync', x: '-118', y: 1, label },
                                                                    { name: 'Sync', x: '-117', y: 1, label },
                                                                    { name: 'Sync', x: '-116', y: 1, label },
                                                                    { name: 'Sync', x: '-115', y: 1, label },
                                                                    { name: 'Sync', x: '-114', y: 1, label },
                                                                    { name: 'Sync', x: '-113', y: 1, label },
                                                                    { name: 'Sync', x: '-112', y: 1, label },
                                                                    { name: 'Sync', x: '-111', y: 1, label },
                                                                    { name: 'Sync', x: '-110', y: 1, label },
                                                                    { name: 'Sync', x: '-109', y: 1, label },
                                                                    { name: 'Sync', x: '-108', y: 1, label },
                                                                    { name: 'Sync', x: '-107', y: 1, label },
                                                                    { name: 'Sync', x: '-106', y: 1, label },
                                                                    { name: 'Sync', x: '-105', y: 1, label },
                                                                    { name: 'Sync', x: '-104', y: 1, label },
                                                                    { name: 'Sync', x: '-103', y: 1, label },
                                                                    { name: 'Sync', x: '-102', y: 1, label },
                                                                    { name: 'Sync', x: '-101', y: 1, label },
                                                                    { name: 'Sync', x: '-100', y: 1, label },
                                                                    { name: 'Sync', x: '-99', y: 1, label },
                                                                    { name: 'Sync', x: '-98', y: 1, label },
                                                                    { name: 'Sync', x: '-97', y: 1, label },
                                                                    { name: 'Sync', x: '-96', y: 1, label },
                                                                    { name: 'Sync', x: '-95', y: 1, label },
                                                                    { name: 'Sync', x: '-94', y: 1, label },
                                                                    { name: 'Sync', x: '-93', y: 1, label },
                                                                    { name: 'Sync', x: '-92', y: 1, label },
                                                                    { name: 'Sync', x: '-91', y: 1, label },
                                                                    { name: 'Sync', x: '-90', y: 1, label },
                                                                    { name: 'Sync', x: '-89', y: 1, label },
                                                                    { name: 'Sync', x: '-88', y: 1, label },
                                                                    { name: 'Sync', x: '-87', y: 1, label },
                                                                    { name: 'Sync', x: '-86', y: 1, label },
                                                                    { name: 'Sync', x: '-85', y: 1, label },
                                                                    { name: 'Sync', x: '-84', y: 1, label },
                                                                    { name: 'Sync', x: '-83', y: 1, label },
                                                                    { name: 'Sync', x: '-82', y: 1, label },
                                                                    { name: 'Sync', x: '-81', y: 1, label },
                                                                    { name: 'Sync', x: '-80', y: 1, label },
                                                                    { name: 'Sync', x: '-79', y: 1, label },
                                                                    { name: 'Sync', x: '-78', y: 1, label },
                                                                    { name: 'Sync', x: '-77', y: 1, label },
                                                                    { name: 'Sync', x: '-76', y: 1, label },
                                                                    { name: 'Sync', x: '-75', y: 1, label },
                                                                    { name: 'Sync', x: '-74', y: 1, label },
                                                                    { name: 'Sync', x: '-73', y: 1, label },
                                                                    { name: 'Sync', x: '-72', y: 1, label },
                                                                    { name: 'Sync', x: '-71', y: 1, label },
                                                                    { name: 'Sync', x: '-70', y: 1, label },
                                                                    { name: 'Sync', x: '-69', y: 1, label },
                                                                    { name: 'Sync', x: '-68', y: 1, label },
                                                                    { name: 'Sync', x: '-67', y: 1, label },
                                                                    { name: 'Sync', x: '-66', y: 1, label },
                                                                    { name: 'Sync', x: '-65', y: 1, label },
                                                                    { name: 'Sync', x: '-64', y: 1, label },
                                                                    { name: 'Sync', x: '-63', y: 1, label },
                                                                    { name: 'Sync', x: '-62', y: 1, label },
                                                                    { name: 'Sync', x: '-61', y: 1, label },
                                                                    { name: 'Sync', x: '-60', y: 1, label },
                                                                    { name: 'Sync', x: '-60', y: 1, label },
                                                                    { name: 'Sync', x: '-59', y: 1, label },
                                                                    { name: 'Sync', x: '-58', y: 1, label },
                                                                    { name: 'Sync', x: '-57', y: 1, label },
                                                                    { name: 'Sync', x: '-56', y: 1, label },
                                                                    { name: 'Sync', x: '-55', y: 1, label },
                                                                    { name: 'Sync', x: '-54', y: 1, label },
                                                                    { name: 'Sync', x: '-53', y: 1, label },
                                                                    { name: 'Sync', x: '-52', y: 1, label },
                                                                    { name: 'Sync', x: '-51', y: 1, label },
                                                                    { name: 'Sync', x: '-50', y: 0, label },
                                                                    { name: 'Sync', x: '-49', y: 1, label },
                                                                    { name: 'Sync', x: '-48', y: 1, label },
                                                                    { name: 'Sync', x: '-47', y: 1, label },
                                                                    { name: 'Sync', x: '-46', y: 1, label },
                                                                    { name: 'Sync', x: '-45', y: 1, label },
                                                                    { name: 'Sync', x: '-44', y: 1, label },
                                                                    { name: 'Sync', x: '-43', y: 1, label },
                                                                    { name: 'Sync', x: '-42', y: 1, label },
                                                                    { name: 'Sync', x: '-41', y: 1, label },
                                                                    { name: 'Sync', x: '-40', y: 0, label },
                                                                    { name: 'Sync', x: '-39', y: 1, label },
                                                                    { name: 'Sync', x: '-38', y: 1, label },
                                                                    { name: 'Sync', x: '-37', y: 1, label },
                                                                    { name: 'Sync', x: '-36', y: 1, label },
                                                                    { name: 'Sync', x: '-35', y: 1, label },
                                                                    { name: 'Sync', x: '-34', y: 1, label },
                                                                    { name: 'Sync', x: '-33', y: 1, label },
                                                                    { name: 'Sync', x: '-32', y: 1, label },
                                                                    { name: 'Sync', x: '-31', y: 1, label },
                                                                    { name: 'Sync', x: '-30', y: 0, label },
                                                                    { name: 'Sync', x: '-29', y: 0, label },
                                                                    { name: 'Sync', x: '-28', y: 1, label },
                                                                    { name: 'Sync', x: '-27', y: 1, label },
                                                                    { name: 'Sync', x: '-26', y: 1, label },
                                                                    { name: 'Sync', x: '-25', y: 1, label },
                                                                    { name: 'Sync', x: '-24', y: 1, label },
                                                                    { name: 'Sync', x: '-23', y: 1, label },
                                                                    { name: 'Sync', x: '-22', y: 1, label },
                                                                    { name: 'Sync', x: '-21', y: 1, label },
                                                                    { name: 'Sync', x: '-20', y: 0, label },
                                                                    { name: 'Sync', x: '-19', y: 0, label },
                                                                    { name: 'Sync', x: '-18', y: 0, label },
                                                                    { name: 'Sync', x: '-17', y: 0, label },
                                                                    { name: 'Sync', x: '-16', y: 0, label },
                                                                    { name: 'Sync', x: '-15', y: 0, label },
                                                                    { name: 'Sync', x: '-14', y: 0, label },
                                                                    { name: 'Sync', x: '-13', y: 0, label },
                                                                    { name: 'Sync', x: '-12', y: 0, label },
                                                                    { name: 'Sync', x: '-11', y: 1, label },
                                                                    { name: 'Sync', x: '-10', y: 1, label },
                                                                    { name: 'Sync', x: '-9', y: 1, label },
                                                                    { name: 'Sync', x: '-8', y: 1, label },
                                                                    { name: 'Sync', x: '-7', y: 1, label },
                                                                    { name: 'Sync', x: '-6', y: 1, label },
                                                                    { name: 'Sync', x: '-5', y: 1, label },
                                                                    { name: 'Sync', x: '-4', y: 1, label },
                                                                    { name: 'Sync', x: '-3', y: 1, label },
                                                                    { name: 'Sync', x: '-2', y: 1, label },
                                                                    { name: 'Sync', x: '-1', y: 1, label },
                                                                    { name: 'Sync', x: '0', y: 1, label },
                                                                ]}
                                                                labelComponent={<ChartTooltip />}
                                                            />
                                                            <ChartBar
                                                                data={[
                                                                    { name: 'Syncing', x: '-50', y: 1, label },
                                                                    { name: 'Syncing', x: '-40', y: 1, label },
                                                                    { name: 'Syncing', x: '-30', y: 1, label },
                                                                    { name: 'Syncing', x: '-29', y: 1, label },
                                                                    { name: 'Syncing', x: '-20', y: 1, label },
                                                                    { name: 'Syncing', x: '-13', y: 1, label },
                                                                    { name: 'Syncing', x: '-12', y: 1, label },
                                                                ]}
                                                                labelComponent={<ChartTooltip />}
                                                            />
                                                            <ChartBar
                                                                data={[
                                                                    { name: 'Out of Sync', x: '-19', y: 1, label },
                                                                    { name: 'Out of Sync', x: '-18', y: 1, label },
                                                                    { name: 'Out of Sync', x: '-17', y: 1, label },
                                                                    { name: 'Out of Sync', x: '-16', y: 1, label },
                                                                    { name: 'Out of Sync', x: '-15', y: 1, label },
                                                                    { name: 'Out of Sync', x: '-14', y: 1, label },

                                                                ]}
                                                                labelComponent={<ChartTooltip />}
                                                            />
                                                        </ChartGroup>
                                                    </Chart>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem>
                            <AccordionToggle
                                onClick={() => toggle('ex2-toggle2')}
                                isExpanded={expanded.includes('ex2-toggle2')}
                                id="ex2-toggle2"
                            >
                                System
                            </AccordionToggle>
                            <AccordionContent id="bordered-expand2" isHidden={!expanded.includes('ex2-toggle2')}>
                                <p>
                                    System info goes here
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem>
                            <AccordionToggle
                                onClick={() => toggle('ex2-toggle3')}
                                isExpanded={expanded.includes('ex2-toggle3')}
                                id="ex2-toggle3"
                            >
                                Workload
                            </AccordionToggle>
                            <AccordionContent id="bordered-expand3" isHidden={!expanded.includes('ex2-toggle3')}>
                                <p>
                                    Workload info goes here
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Tab>
                <Tab eventKey={1} title={<TabTitleText>Configuration</TabTitleText>} aria-label="Default content - Configuration">
                    <table style={{ width: "100%" }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: "20px 0px 0px", verticalAlign: "top" }}>
                                    <Panel style={{ padding: "10px", verticalAlign: "top" }}>
                                        <PanelHeader>Editable labels:</PanelHeader>
                                        <Divider />
                                        <PanelMain ><PanelMainBody>
                                            <table id="tableLabels">
                                                <thead>
                                                    <tr >
                                                        <th style={{ borderBottom: "1pt solid black" }}>Key</th>
                                                        <th style={{ borderBottom: "1pt solid black" }}>Value</th>
                                                        <th style={{ width: "50px" }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td style={cellStyle}>fleet</td>
                                                        <td style={cellStyle}>
                                                            <Dropdown
                                                                isOpen={isOpenFleet}
                                                                onSelect={onFleetSelect}
                                                                onOpenChange={(isOpenFleet: boolean) => setIsOpenFleet(isOpenFleet)}
                                                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                                                    <MenuToggle ref={toggleRef} isFullWidth onClick={onFleetToggleClick} isExpanded={isOpenFleet}>
                                                                        <div id="togglefleet">Select Fleet:</div>
                                                                    </MenuToggle>
                                                                )}
                                                                ouiaId="fleetdropdown"
                                                                shouldFocusToggleOnSelect
                                                            >
                                                                <DropdownList id="dropdown-list-fleet">
                                                                    <SearchInput
                                                                        id="search-fleet"
                                                                        value=""
                                                                        placeholder="Search Fleet"
                                                                        onChange={() => {
                                                                            const searchInput = document.getElementById('search-fleet');
                                                                            const input = searchInput?.getElementsByTagName('input')[0];
                                                                            if (input) {
                                                                                const searchValue = input.value;
                                                                                if (searchValue) {
                                                                                    const filtered = fleetList.filter((item) => {
                                                                                        return item.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
                                                                                    });
                                                                                    setFleetList(filtered);
                                                                                } else {
                                                                                    setFleetList(fleetList);
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {
                                                                        // for each fleet in fleetList, create a DropdownItem
                                                                        fleetListFiltered.map((fleet) => (
                                                                            <DropdownItem
                                                                                value={fleet.name}
                                                                                key={fleet.id}
                                                                                description={fleet.description}
                                                                                onClick={() => {
                                                                                    const toggle = document.getElementById('togglefleet');
                                                                                    if (toggle) {
                                                                                        toggle.innerHTML = fleet.name;
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {fleet.name}
                                                                            </DropdownItem>
                                                                        ))
                                                                    }
                                                                </DropdownList>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                    {tableRows.map((row, index) => (
                                                        <tr key={index}>
                                                            <td style={cellStyle} >
                                                                <TextInput
                                                                    ouiaId={`key-${index}`}
                                                                    value={tableRows[index].key}
                                                                    placeholder="Key"
                                                                    aria-label="Key"
                                                                    onChange={(_event, key) => setTableRows(prevRows => prevRows.map((row, i) => i === index ? { ...row, key } : row))}
                                                                />
                                                            </td>
                                                            <td style={cellStyle}>
                                                                <TextInput
                                                                    ouiaId={`value-${index}`}
                                                                    value={tableRows[index].value}
                                                                    placeholder="Value"
                                                                    aria-label="Value"
                                                                    onChange={(_event, value) => setTableRows(prevRows => prevRows.map((row, i) => i === index ? { ...row, value } : row))}
                                                                />

                                                            </td>
                                                            <td>
                                                                <Button ouiaId={`${index}`} variant="link" size="sm" aria-label="Delete" icon={<TrashIcon />} onClick={() => handleDeleteRow(index)} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <Button style={{ margin: "10px" }} variant="tertiary" onClick={addNewLabel}>Add New Label</Button>

                                            <Button variant="primary" onClick={saveLabels} >Save changes</Button>
                                        </PanelMainBody>
                                        </PanelMain>
                                    </Panel>
                                </td>
                                <td style={{ padding: "4px 0px 0px", width: "65%", verticalAlign: "top" }}>
                                    <div >
                                        <CodeBlock>
                                            <CodeBlockCode style={{ background: '#212427', color: '#ffffff', padding: '10px' }} id="code-content">{YAML.stringify(device.contents)}</CodeBlockCode>
                                        </CodeBlock>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Tab>
                <Tab eventKey={4} title={<TabTitleText>Actions</TabTitleText>} isAriaDisabled>
                    TODO
                </Tab>
            </Tabs>


        </PageSection>
    );
};

export { Device };
