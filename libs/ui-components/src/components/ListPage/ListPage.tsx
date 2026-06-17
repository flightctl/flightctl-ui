import * as React from 'react';

import { Content, PageSection, Stack, StackItem, Title, TitleProps } from '@patternfly/react-core';

type ListPageProps = {
  title: string;
  description?: string;
  headingLevel?: TitleProps['headingLevel'];
  children: React.ReactNode;
};

const ListPage: React.FC<ListPageProps> = ({ title, description, headingLevel = 'h1', children }) => {
  return (
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel={headingLevel} size="3xl" data-testid="list-page-title">
            {title}
          </Title>
        </StackItem>
        {description && (
          <StackItem>
            <Content data-testid="list-page-description">{description}</Content>
          </StackItem>
        )}
      </Stack>
      {children}
    </PageSection>
  );
};

export default ListPage;
