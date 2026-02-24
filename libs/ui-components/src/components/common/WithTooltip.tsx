import * as React from 'react';
import { PropsWithChildren } from 'react';
import { Tooltip } from '@patternfly/react-core';

type WithTooltipProps = {
  showTooltip: boolean;
  content: React.ReactNode;
  children?: React.ReactElement;
  triggerRef?: React.RefObject<HTMLElement>;
};

const WithTooltip = ({ showTooltip, content, children, triggerRef }: PropsWithChildren<WithTooltipProps>) => {
  if (!showTooltip) {
    return <>{children}</>;
  }

  return (
    <Tooltip content={content} triggerRef={triggerRef}>
      {children}
    </Tooltip>
  );
};

export default WithTooltip;
