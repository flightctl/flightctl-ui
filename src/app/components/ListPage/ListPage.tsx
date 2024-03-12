import { PageSection, PageSectionVariants, Split, SplitItem, Title } from '@patternfly/react-core';
import * as React from 'react';

type ListPageProps = {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const ListPage: React.FC<ListPageProps> = ({ title, children, actions }) => {
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Split hasGutter>
          <SplitItem isFilled>
            <Title headingLevel="h1" size="3xl">
              {title}
            </Title>
          </SplitItem>
          {actions && <SplitItem>{actions}</SplitItem>}
        </Split>
      </PageSection>
      <PageSection>{children}</PageSection>
    </>
  );
};

export default ListPage;
