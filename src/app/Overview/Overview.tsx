import React, { useState, useEffect } from 'react';
import { fetchData } from '@app/utils/commonFunctions';
import { useAuth } from 'react-oidc-context';
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
import { set } from 'yaml/dist/schema/yaml-1.1/set';



const Overview: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const auth = useAuth();

  /*
    function getEvents() {
      if (auth.user?.access_token) {
        fetchData('fleets', auth.user?.access_token).then((data) => {
          setFleetsData(data);
          setIsLoading(false);
        });
      } else {
        console.log("no access token");
      }
    }
    React.useEffect(() => {
      setIsLoading(true);
      getEvents();
      const interval = setInterval(() => {
        getEvents();
      }, 10000);
      return () => clearInterval(interval);
    },[auth]);
  
  
  */







  function getDevices() {
    if (auth.user?.access_token) {
      fetchData("devices", auth.user?.access_token).then((data) => {
        /*
        data = {"apiVersion":"v1alpha1","items":[{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:50:53Z","name":"8fef85736b9b2462e8f4f258030544429305ab0fd7ae5591f3afe467e3ff081f"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:05Z","name":"686d7f89b3767d121fb2b1c5c6c2fbd9da86aefd70591cbed3e00af98f4391cd"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:07Z","name":"87f0bfee4d9be24d3f5b9e004c49ad58a6ba06e647e86748092134fcfec67d76"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:14Z","name":"700925fb021b534018cd8749b2656cae7eba6d87aa6dda1cec093a055a38e16c"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:22Z","name":"c18d0582c13f3890f5b2de6733feede3665e8f7570539a74a63b784b91e9483f"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:26Z","name":"5571d36e302d014c8cef703f2d070a529efe6d06c98633b0779794b7a1e7b7de"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:42Z","name":"0e7c323d0390a68450d456f6df9aa83fc2ed70ba3d0083ed9d9238d03769ed47"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:43Z","name":"c03f5b14be069e3268bec6355b78aa63831f3ccda806624f24558ea0ba87de9e"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:44Z","name":"2e2086871c0352bb3d99edb9968ae4c2342bc2405d67c16e5fd0fba4d8a33a28"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:44Z","name":"3c5bb8b9d6f0281e036e41216c1fc7e4039ad2cd1abafb35fe196f186a75918c"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}}],"kind":"DeviceList","metadata":{}};
    
        */
        const devices = data.items;
        const div = document.getElementById('grid-total');
        if (div) {
          div.innerHTML = `Total: ${devices.length}<br>`;
          let cellcount = 0;
          const maxcellsperline = 10;
          let onlinecount = 0;
          let offlinecount = 0;
          let syncronizingcount = 0;
          if (devices.length > 0) {
            const table = document.createElement('table');
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
                newDiv.style.width = '20px';
                newDiv.style.height = '20px';
                newDiv.style.backgroundColor = status === 'True' ? 'green' : 'red';
                newDiv.style.display = 'inline-block';
                newDiv.style.margin = '0px 5px 0px 0px';
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
                td.style.padding = '0 !important';
                tr.style.padding = '0 !important';
                tr?.appendChild(td);
              }
            });
            table.style.borderCollapse = 'collapse !important';
            div.appendChild(table);
          }

          setIsLoading(false);
        }
      });
    }
  }

  React.useEffect(() => {
    setIsLoading(true);
    getDevices();
    const interval = setInterval(() => {
      getDevices();
    }, 10000);
    return () => clearInterval(interval);
  }, [auth]);

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
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Overview</Title>
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
          <ChipGroup categoryName='Legend:' numChips={0} collapsedText='Show'>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'red', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Offline</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'green', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Online</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'yellow', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Degraded</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'blue', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Syncing</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
            <Chip isReadOnly={true}>
              <table>
                <tbody>
                  <tr>
                    <td><div style={{ background: 'gray', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div></td>
                    <td>Offline</td>
                  </tr>
                </tbody>
              </table>
            </Chip>
          </ChipGroup>

        </CardBody>
      </Card>
      <div id="tooltip" style={{ display: 'none' }}></div>
      <img src="/images/mock-ui-fleet-status.png" alt="Mock Fleet Status" width="834" height="318" />
    </PageSection>
  )
};

export { Overview };

