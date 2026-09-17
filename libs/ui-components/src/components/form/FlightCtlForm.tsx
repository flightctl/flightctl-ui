import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Form } from '@patternfly/react-core';

import './FlightCtlForm.css';

// Nested form section that adds a left padding to the children.
export const FlightCtlFormSection = ({ children }: React.PropsWithChildren) => (
  <div className="fctl-form-section">{children}</div>
);

const FlightCtlForm = ({
  className,
  children,
  isResponsive = true,
}: React.PropsWithChildren<{ className?: string; isResponsive?: boolean }>) => (
  <div className={isResponsive ? 'fctl-form fctl-form--responsive' : 'fctl-form'}>
    <div className="fctl-form__content">
      <Form
        className={className}
        onSubmit={(ev) => {
          ev.preventDefault();
        }}
      >
        {children}
      </Form>
    </div>
  </div>
);

export default FlightCtlForm;
