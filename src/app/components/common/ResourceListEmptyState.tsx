import * as React from 'react';
import { EmptyState, EmptyStateHeader, EmptyStateIcon } from '@patternfly/react-core';

type ResourceListEmptyStateProps = {
  titleText: string;
  icon: React.ComponentType;
};

const ResourceListEmptyState = ({
  titleText,
  icon,
  children,
}: React.PropsWithChildren<ResourceListEmptyStateProps>) => (
  <EmptyState style={{ '--pf-v5-c-empty-state--PaddingTop': '4rem' } as React.CSSProperties}>
    <EmptyStateHeader titleText={titleText} headingLevel="h4" icon={<EmptyStateIcon icon={icon}></EmptyStateIcon>} />
    {children}
  </EmptyState>
);
export default ResourceListEmptyState;
