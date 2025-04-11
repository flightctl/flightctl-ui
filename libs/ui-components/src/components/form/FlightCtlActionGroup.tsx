import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { ActionGroup } from '@patternfly/react-core';

import './FlightCtlActionGroup.css';

const FlightCtlActionGroup = ({ children }: React.PropsWithChildren) => (
  <ActionGroup className="fctl-form__action-footer">{children}</ActionGroup>
);

export default FlightCtlActionGroup;
