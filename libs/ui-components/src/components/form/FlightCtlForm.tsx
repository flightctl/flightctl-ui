import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Form } from '@patternfly/react-core';

import './FlightCtlForm.css';

const FlightCtlForm = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <Form
      className={className ? `fctl-form ${className}` : 'fctl-form'}
      onSubmit={(ev) => {
        ev.preventDefault();
      }}
    >
      {children}
    </Form>
  );
};

export default FlightCtlForm;
