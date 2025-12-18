import * as React from 'react';
import { EmptyState } from '@patternfly/react-core';

type ResourceListEmptyStateProps = {
  titleText: string;
  icon: React.ComponentType;
};

const ResourceListEmptyState = ({
  titleText,
  icon,
  children,
}: React.PropsWithChildren<ResourceListEmptyStateProps>) => (
  <EmptyState
    headingLevel="h4"
    icon={icon}
    titleText={titleText}
    style={{ '--pf-v6-c-empty-state--PaddingBlockStart': '4rem' } as React.CSSProperties}
  >
    {children}
  </EmptyState>
);
export default ResourceListEmptyState;
