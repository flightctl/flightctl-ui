import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
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
} from '@patternfly/react-core';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { deviceList } from '@app/old/utils/commonDataTypes';



const Workload: React.FunctionComponent = () => {
  const [data, isLoading, error] = useFetchPeriodically<deviceList>('devices');

  React.useEffect(() => {
    if (data) {
      const devices = data.items;
      const div = document.getElementById('grid-total');
      if (div) {
        div.innerHTML = `Total: ${devices.length}<br>`;
        let cellcount = 0;
        const maxcellsperline = 40;
        let onlinecount = 0;
        let offlinecount = 0;
        let syncronizingcount = 0;
        if (devices.length > 0) {
          const table = document.createElement('table');
          table.className = 'deviceGrid';
          table.innerHTML = '<tbody></tbody>';
          let tr = document.createElement('tr');
          const tbody = table.getElementsByTagName('tbody')[0];
          tbody.appendChild(tr);
          devices.forEach((device) => {
            const status = device.status.online;
            if (div) {
              cellcount++;
              if (cellcount > maxcellsperline) {
                tr = document.createElement('tr');
                tbody.appendChild(tr);
                cellcount = 1;
              }
              const newDiv = document.createElement('div');
              // set newDiv class deviceSquare
              newDiv.className = 'deviceSquare';
              newDiv.style.width = '7px';
              newDiv.style.height = '7px';
              newDiv.style.backgroundColor = status === 'True' ? 'limegreen' : 'tomato';
              newDiv.style.display = 'inline-block';
              newDiv.style.margin = '2px 2px 0px 0px';
              newDiv.onclick = () => {
                window.location.href = `/device/${device.metadata.name}`;
              };
              const tooltip = document.getElementById('tooltip');
              newDiv.onmouseover = (event: MouseEvent) => {
                if (tooltip) {
                  if (device.status.systemInfo === undefined) {
                    device.status.systemInfo = {};
                  }
                  device.status.systemInfo.architecture = device.status.systemInfo.architecture || "-";
                  device.status.systemInfo.bootID = device.status.systemInfo.bootID || "-";
                  device.status.systemInfo.machineID = device.status.systemInfo.machineID || "-";
                  device.status.systemInfo.operatingSystem = device.status.systemInfo.operatingSystem || "-";
                  device.status.online = device.status.online || "-";

                  tooltip.style.display = 'block';
                  tooltip.style.position = 'absolute';
                  tooltip.style.left = `${event.clientX + 10}px`;
                  tooltip.style.top = `${event.clientY + 10}px`;
                  tooltip.style.backgroundColor = 'white';
                  tooltip.style.border = '1px solid black';
                  tooltip.style.padding = '5px';
                  tooltip.style.zIndex = '1';
                  tooltip.innerHTML = `Name: ${device.metadata.name}<br>Architecture: ${device.status.systemInfo.architecture}<br>Boot ID: ${device.status.systemInfo.bootID}<br>Machine ID: ${device.status.systemInfo.machineID}<br>Operating System: ${device.status.systemInfo.operatingSystem}<br>Status: ${device.status.online}`;
                }
                newDiv.onmouseleave = () => {
                  if (tooltip) {
                    tooltip.style.display = 'none';
                  }
                }
              };
              const td = document.createElement('td');
              td.appendChild(newDiv);
              tr?.appendChild(td);
            }
          });
          div.appendChild(table);
        };
      }
    }
  }, [data]);

  const [isOpenFleet, setIsOpenFleet] = React.useState(false);
  const [isOpenRegion, setIsOpenRegion] = React.useState(false);
  const onFleetToggleClick = () => {
    setFleetList(fleetList);
    setIsOpenFleet(!isOpenFleet);
  };
  const onRegionToggleClick = () => {
    setRegionList(regionList);
    setIsOpenRegion(!isOpenRegion);
  };
  const onFleetSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setIsOpenFleet(false);
  };
  const onRegionSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setIsOpenRegion(false);
  };
  const fleetList = [
    { id: 0, name: 'Default', description: 'Default fleet out of the box' },
    { id: 1, name: 'Fleet 1', description: 'Fleet 1 description' },
  ];
  let [fleetListFiltered, setFleetList] = useState(fleetList);
  const regionList = [
    { id: 0, name: 'Unknown', description: 'Unknown region' },
    { id: 1, name: 'Madrid001', description: 'Madrid001, Spain' },
  ];
  let [regionListFiltered, setRegionList] = useState(regionList);
  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Workload</Title>
      <table>
        <tbody>
          <tr>
            <td>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                <FlexItem>
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
                        (<DropdownItem
                          value="All fleets"
                          key="all"
                          description="select all fleets"
                          onClick={() => {
                            const toggle = document.getElementById('togglefleet');
                            if (toggle) {
                              toggle.innerHTML = "All fleets";
                            }
                          }}
                        >
                          All fleets
                        </DropdownItem>)
                      }{
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
                </FlexItem>
                <Divider
                  orientation={{
                    default: 'vertical'
                  }}
                  inset={{ default: 'insetSm' }}
                />
                <FlexItem>
                  <Dropdown
                    isOpen={isOpenRegion}
                    onSelect={onRegionSelect}
                    onOpenChange={(isOpenRegion: boolean) => setIsOpenRegion(isOpenRegion)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle ref={toggleRef} isFullWidth onClick={onRegionToggleClick} isExpanded={isOpenRegion}>
                        <div id="toggleregion">Select Region:</div>
                      </MenuToggle>
                    )}
                    ouiaId="regiondropdown"
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList id="dropdown-list-region">
                      <SearchInput
                        id="search-region"
                        value=""
                        placeholder="Search region"
                        onChange={() => {
                          const searchInput = document.getElementById('search-region');
                          const input = searchInput?.getElementsByTagName('input')[0];
                          if (input) {
                            const searchValue = input.value;
                            if (searchValue) {
                              const filtered = regionList.filter((item) => {
                                return item.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
                              });
                              setRegionList(filtered);
                            } else {
                              setRegionList(regionList);
                            }
                          }
                        }}
                      />
                      {
                        (<DropdownItem
                          value="All regions"
                          key="all"
                          description="select all regions"
                          onClick={() => {
                            const toggle = document.getElementById('toggleregion');
                            if (toggle) {
                              toggle.innerHTML = "All regions";
                            }
                          }}
                        >
                          All regions
                        </DropdownItem>)
                      }{
                        regionListFiltered.map((region) => (
                          <DropdownItem
                            value={region.name}
                            key={region.id}
                            description={region.description}
                            onClick={() => {
                              const toggle = document.getElementById('toggleregion');
                              if (toggle) {
                                toggle.innerHTML = region.name;
                              }
                            }}
                          >
                            {region.name}
                          </DropdownItem>
                        ))
                      }
                    </DropdownList>
                  </Dropdown>
                </FlexItem>
              </Flex>
            </td>
          </tr>
        </tbody>
      </table>
      <Card isCompact={true} isFlat={true} >
        <CardBody>
          <Flex>
            <FlexItem>
              <div id="grid-total">Total: - <br></br><div id="total-toggle"></div><br></br></div>
            </FlexItem>
            <Divider
              orientation={{
                default: 'vertical'
              }}
              inset={{ default: 'insetSm' }}
            />
            <FlexItem>
              <div id="grid-insync">In sync: WIP <br></br></div>
            </FlexItem>
          </Flex>
          <br></br><br></br>
          <ChipGroup categoryName='' numChips={0} collapsedText='Show legend' expandedText='Hide legend'>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'limegreen', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Online</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'tomato', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Error</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'khaki', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Degraded</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'cornflowerblue', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Syncing</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'gainsboro', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Offline</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
          </ChipGroup>

        </CardBody>
      </Card>
      <div id="tooltip" style={{ display: 'none' }}></div>
    </PageSection>
  )
};

export { Workload };

