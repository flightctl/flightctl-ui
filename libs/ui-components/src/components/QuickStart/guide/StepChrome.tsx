import * as React from 'react';
import { Content, ContentVariants, List, ListItem } from '@patternfly/react-core';

import { useQuickStartGuide } from '../QuickStartContext';

export const StepTitle = ({ children }: React.PropsWithChildren) => <Content component="h5">{children}</Content>;

export const StepBody = ({ children }: React.PropsWithChildren) => (
  <Content component="p" className="pf-v6-u-my-md">
    {children}
  </Content>
);

export const StepItemList = ({ title, items }: { title: string; items: string[] }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <StepBody>{title}:</StepBody>
      <List style={{ gap: 0 }} className="pf-v6-u-mt-sm pf-v6-u-mb-md">
        {items.map((item, index) => (
          <ListItem key={index}>
            <Content component="small">{item}</Content>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export const StepHint = ({ children, hasGap }: React.PropsWithChildren<{ hasGap?: boolean }>) => (
  <Content component={ContentVariants.small} className={hasGap ? 'pf-v6-u-mt-md' : 'pf-v6-u-mb-0'}>
    {children}
  </Content>
);

interface StepHeaderProps {
  title: React.ReactNode;
}

export const StepHeader = ({ title }: StepHeaderProps) => {
  const { setGuidePresentation } = useQuickStartGuide();

  React.useLayoutEffect(() => {
    setGuidePresentation({ stepTitle: title });
  }, [setGuidePresentation, title]);

  return <StepTitle>{title}</StepTitle>;
};

export const TbdMarker = ({ patternName }: { patternName: string }) => (
  <Content component="p" className="pf-v6-u-mb-0">
    <strong style={{ color: 'red' }}>TBD: {patternName}</strong>
  </Content>
);
