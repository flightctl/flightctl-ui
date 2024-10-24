import * as React from 'react';

// eslint-disable-next-line no-restricted-imports
import { DescriptionList, DescriptionListProps } from '@patternfly/react-core';

// Wrapper that adds the PF4 class for description lists as their styles are not loaded in the Console
const FlightCtlDescriptionList = ({ children, ...rest }: DescriptionListProps) => (
  <DescriptionList {...rest} className="pf-c-description-list">
    {children}
  </DescriptionList>
);

export default FlightCtlDescriptionList;
