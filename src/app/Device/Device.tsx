import React, { useState } from 'react';
import { fetchDataObj } from '@app/utils/commonFunctions';
import { device } from '@app/utils/commonDataTypes';
import YAML from 'yaml';
import {
    Accordion,
    AccordionItem,
    AccordionContent,
    AccordionToggle,
    AccordionExpandableContentBody,
    Alert,
    AlertActionCloseButton,
    AlertActionLink,
    AlertGroup,
    CodeBlock,
    CodeBlockAction,
    CodeBlockCode,
    ClipboardCopyButton,
    ExpandableSection,
    ExpandableSectionToggle,
    Button,
    ButtonVariant,
    Divider,
    Dropdown,
    DropdownList,
    DropdownItem,
    EmptyState,
    EmptyStateActions,
    EmptyStateBody,
    EmptyStateFooter,
    EmptyStateHeader,
    EmptyStateIcon,
    EmptyStateVariant,
    Icon,
    InputGroup,
    InputGroupItem,
    MenuToggle,
    MenuToggleElement,
    MenuFooter,
    MenuSearch,
    MenuSearchInput,
    PageSection,
    Panel,
    PanelMain,
    PanelMainBody,
    PanelHeader,
    SearchInput,
    Spinner,
    Tabs,
    Tab,
    TabTitleText,
    Text,
    TextContent,
    TextInput,
    TextVariants,
    Title,
    Wizard
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
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
if (deviceID != null) {
    fetchDataObj("devices", deviceID).then((data) => {
        device.contents = data;
    });
}


const Device: React.FunctionComponent = () => {
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
            if (row.key !== '') {
                labels[row.key] = row.value;
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

        if (tableRows[0].key === 'fleet') {
            tableRows.shift();
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
            <p>
              Agent info goes here
            </p>
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
