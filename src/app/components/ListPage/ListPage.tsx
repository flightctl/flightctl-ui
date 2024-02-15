import { PageSection, PageSectionVariants, Stack, StackItem, Title } from '@patternfly/react-core';
import * as React from 'react';

type ListPageProps = {
  title: string;
  children: React.ReactNode;
};

const ListPage: React.FC<ListPageProps> = ({ title, children }) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="3xl">
            {title}
          </Title>
        </StackItem>
        <StackItem>{children}</StackItem>
      </Stack>
    </PageSection>
  );
};

export default ListPage;
