import * as React from 'react';
import { PropsWithChildren } from 'react';
import { Tooltip } from '@patternfly/react-core';

type WithTooltipProps = {
  showTooltip: boolean;
  content: React.ReactNode;
  children: React.ReactElement;
};

const WithTooltip = ({ showTooltip, content, children }: PropsWithChildren<WithTooltipProps>) =>
  showTooltip ? <Tooltip content={content}>{children}</Tooltip> : children;

export default WithTooltip;
