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
  CardHeader,
} from '@patternfly/react-core';

const Filter: React.FunctionComponent = () => {
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
    );
}
export { Filter };