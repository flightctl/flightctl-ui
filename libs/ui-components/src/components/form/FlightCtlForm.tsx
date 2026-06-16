import * as React from 'react';
import {
  Alert,
  AlertProps,
  // eslint-disable-next-line no-restricted-imports
  Form,
  Grid,
  GridItem,
  globalWidthBreakpoints,
  gridItemSpanValueShape,
} from '@patternfly/react-core';

import './FlightCtlForm.css';

const widthToSpan = (width: number = 0): gridItemSpanValueShape => {
  if (width < globalWidthBreakpoints.sm) {
    return 12;
  }
  if (width < globalWidthBreakpoints.md) {
    return 10;
  }
  if (width < globalWidthBreakpoints.lg) {
    return 8;
  }
  return 6;
};

const useContainerWidth = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>(0);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setWidth(ref.current.getBoundingClientRect().width);

    let rafId: number;
    const observer = new ResizeObserver((entries) => {
      rafId = requestAnimationFrame(() => {
        setWidth(entries[0].contentRect.width);
      });
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return [ref, width] as const;
};

// FlightCtlFormAlerts are displayed as inline by default, and are full width (via CSS styling)
export const FlightCtlFormAlert = ({ className, isInline, ...props }: AlertProps) => (
  <Alert isInline={isInline ?? true} className={`fctl-form-alert ${className || ''}`} {...props} />
);

const FlightCtlForm = ({
  className,
  children,
  isResponsive = true,
}: React.PropsWithChildren<{ className?: string; isResponsive?: boolean }>) => {
  const [ref, width] = useContainerWidth();
  const formSpan = isResponsive ? widthToSpan(width) : 12;

  return (
    <div ref={ref} className="fctl-form" style={{ '--fctl-form-span': formSpan } as React.CSSProperties}>
      <Grid span={formSpan}>
        <GridItem>
          <Form
            className={className}
            onSubmit={(ev) => {
              ev.preventDefault();
            }}
          >
            {children}
          </Form>
        </GridItem>
      </Grid>
    </div>
  );
};

export default FlightCtlForm;
