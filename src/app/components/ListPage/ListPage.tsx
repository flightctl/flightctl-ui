import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import * as React from 'react';

type ListPageProps = {
  title: string;
  children: React.ReactNode;
};

const ListPage: React.FC<ListPageProps> = ({ title, children }) => {
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="3xl">
          {title}
        </Title>
      </PageSection>
      <PageSection>{children}</PageSection>
    </>
  );
};

export default ListPage;
