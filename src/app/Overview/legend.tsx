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

const Legend: React.FunctionComponent = () => {
  return (
    <Flex justifyContent={{ default: 'justifyContentCenter' }}>
    <FlexItem>
      <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ background: 'limegreen', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div> Online</div>
    </FlexItem>
    <FlexItem>
    <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ background: 'tomato', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div> Error</div>
    </FlexItem>
    <FlexItem>
    <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ background: 'khaki', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div> Degraded</div>
    </FlexItem>
    <FlexItem>
    <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ background: 'cornflowerblue', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}> </div> Syncing</div>
    </FlexItem>
    <FlexItem>
    <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ background: 'gainsboro', width: '15px', height: '15px', marginRight: '5px' } as React.CSSProperties}></div>Offline</div>
    </FlexItem>
  </Flex>
    );
}
export { Legend };