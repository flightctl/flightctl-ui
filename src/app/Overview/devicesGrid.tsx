import React, { useState, useEffect } from 'react';
import { fetchData } from '@app/utils/commonFunctions';
import { useAuth } from 'react-oidc-context';
import {
  Card,
  CardBody,
  Chip,
  ChipGroup,
  EmptyStateIcon,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  Divider,
  SearchInput,
  Spinner,
  Dropdown,
  DropdownList,
  DropdownItem,
  PageSection,
  Title,
  CardHeader,
} from '@patternfly/react-core';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
interface DevicesGridProps {
    data: any;
  }
const DevicesGrid: React.FunctionComponent<DevicesGridProps> = ({ data }) => {

    if (data === null || data.items === undefined) {
        return <EmptyStateIcon icon={Spinner} />;
    }
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
            if (Math.random() < 0.9) {
              newDiv.style.backgroundColor = 'limegreen';
            } else {
              newDiv.style.backgroundColor = 'tomato';
            }
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
      }
    }

    return (
<div id="grid-total"><br></br><div id="total-toggle"><EmptyStateIcon icon={Spinner} /></div><br></br><div id="tooltip" style={{ display: 'none' }}></div></div>
    );
}   
export { DevicesGrid };
