import * as React from 'react';
import { ActionGroup } from '@patternfly/react-core';

import './FlightCtlActionGroup.css';

const FlightCtlActionGroup = ({ children }: React.PropsWithChildren<Record<never, never>>) => (
  <ActionGroup className="fctl-form__action-footer">{children}</ActionGroup>
);

export default FlightCtlActionGroup;
