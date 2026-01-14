import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Form } from '@patternfly/react-core';

const FlightCtlForm = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <Form
      className={className}
      onSubmit={(ev) => {
        ev.preventDefault();
      }}
    >
      {children}
    </Form>
  );
};

export default FlightCtlForm;
