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

    const auth = useAuth();
    if (deviceID != null) {
        fetchDataObj("devices", deviceID, auth.user?.access_token ?? '').then((data) => {
            device.contents = data;
        });
    }
    const label = ({ datum }) => `${datum.name}: ${datum.x}`;
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
            if (row){
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
        if (tableRows[0]){
            if (tableRows[0].key === 'fleet') {
                tableRows.shift();
            }
        }
    }
    const [value, setValue] = React.useState('');

    const handleDeleteRow = (index) => {
        console.log("index:" + index);
        console.log(tableRows);
        const tmpTableRows = tableRows.filter((row, i) => i !== index);
        console.log(tmpTableRows);
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
    return (
        <PageSection >

            <Title headingLevel="h1" size="lg">Device Details</Title>
            <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        isBox={true}
        aria-label="Tabs in the default example"
        role="region"
        style={{padding: "10px 0px 0px 0px"}}
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
            <table style={{width: "100%"}}>
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
                    
                    <td style={{ width: "60%"}}>
                        Last hour status:
                    <div style={{ height: '100px', width: '500px'}}>
        <Chart
          ariaDesc="Average number of pets"
          ariaTitle="Bar chart example"
          legendData={[{ name: 'Sync' }, { name: 'Syncing' }, { name: 'Out of Sync' }]}
          legendPosition="bottom"
          height={100}
          width={500}
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
          <ChartAxis  />
          <ChartGroup offset={1}>
            <ChartBar
              data={[
                { name: 'Sync', x: '-60m', y: 1, label },
                { name: 'Sync', x: '-59m', y: 1, label },
                { name: 'Sync', x: '-58m', y: 1, label },
                { name: 'Sync', x: '-57m', y: 1, label },
                { name: 'Sync', x: '-56m', y: 1, label },
                { name: 'Sync', x: '-55m', y: 1, label },
                { name: 'Sync', x: '-54m', y: 1, label },
                { name: 'Sync', x: '-53m', y: 1, label },
                { name: 'Sync', x: '-52m', y: 1, label },
                { name: 'Sync', x: '-51m', y: 1, label },
                { name: 'Sync', x: '-50m', y: 1, label },
                { name: 'Sync', x: '-49m', y: 1, label },
                { name: 'Sync', x: '-48m', y: 1, label },
                { name: 'Sync', x: '-47m', y: 1, label },
                { name: 'Sync', x: '-46m', y: 1, label },
                { name: 'Sync', x: '-45m', y: 1, label },
                { name: 'Sync', x: '-44m', y: 1, label },
                { name: 'Sync', x: '-43m', y: 1, label },
                { name: 'Sync', x: '-42m', y: 1, label },
                { name: 'Sync', x: '-41m', y: 1, label },
                { name: 'Sync', x: '-40m', y: 1, label },
                { name: 'Sync', x: '-39m', y: 1, label },
                { name: 'Sync', x: '-38m', y: 1, label },
                { name: 'Sync', x: '-37m', y: 1, label },
                { name: 'Sync', x: '-36m', y: 1, label },
                { name: 'Sync', x: '-35m', y: 1, label },
                { name: 'Sync', x: '-34m', y: 1, label },
                { name: 'Sync', x: '-33m', y: 1, label },
                { name: 'Sync', x: '-32m', y: 1, label },
                { name: 'Sync', x: '-31m', y: 1, label },
                { name: 'Sync', x: '-30m', y: 0, label},
                { name: 'Sync', x: '-29m', y: 1, label },
                { name: 'Sync', x: '-28m', y: 1, label },
                { name: 'Sync', x: '-27m', y: 1, label },
                { name: 'Sync', x: '-26m', y: 1, label },
                { name: 'Sync', x: '-25m', y: 1, label },
                { name: 'Sync', x: '-24m', y: 1, label },
                { name: 'Sync', x: '-23m', y: 1, label },
                { name: 'Sync', x: '-22m', y: 1, label },
                { name: 'Sync', x: '-21m', y: 1, label },
                { name: 'Sync', x: '-20m', y: 0, label },
                { name: 'Sync', x: '-19m', y: 0, label },
                { name: 'Sync', x: '-18m', y: 0, label },
                { name: 'Sync', x: '-17m', y: 0, label },
                { name: 'Sync', x: '-16m', y: 0, label },
                { name: 'Sync', x: '-15m', y: 0, label },
                { name: 'Sync', x: '-14m', y: 0, label },
                { name: 'Sync', x: '-13m', y: 1, label },
                { name: 'Sync', x: '-12m', y: 1, label },
                { name: 'Sync', x: '-11m', y: 1, label },
                { name: 'Sync', x: '-10m', y: 1, label },
                { name: 'Sync', x: '-9m', y: 1, label },
                { name: 'Sync', x: '-8m', y: 1, label },
                { name: 'Sync', x: '-7m', y: 1, label },
                { name: 'Sync', x: '-6m', y: 1, label },
                { name: 'Sync', x: '-5m', y: 1, label },
                { name: 'Sync', x: '-4m', y: 1, label },
                { name: 'Sync', x: '-3m', y: 1, label },
                { name: 'Sync', x: '-2m', y: 1, label },
                { name: 'Sync', x: '-1m', y: 1, label },
                { name: 'Sync', x: '0m', y: 1, label },
              ]}
              labelComponent={<ChartTooltip  />}
            />
            <ChartBar
              data={[
                { name: 'Syncing', x: '-50m', y: 1, label },
                { name: 'Syncing', x: '-40m', y: 1, label },
                { name: 'Syncing', x: '-30m', y: 1, label },
                { name: 'Syncing', x: '-29m', y: 1, label },
                { name: 'Syncing', x: '-20m', y: 1, label },
                { name: 'Syncing', x: '-13m', y: 1, label },
                { name: 'Syncing', x: '-12m', y: 1, label },
              ]}
              labelComponent={<ChartTooltip/>}
            />
            <ChartBar
              data={[
                { name: 'Out of Sync', x: '-19m', y: 1, label },
                { name: 'Out of Sync', x: '-18m', y: 1, label },
                { name: 'Out of Sync', x: '-17m', y: 1, label },
                { name: 'Out of Sync', x: '-16m', y: 1, label },
                { name: 'Out of Sync', x: '-15m', y: 1, label },
                { name: 'Out of Sync', x: '-14m', y: 1, label },

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
                                                <th style={{width: "50px"}}></th>
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
