import * as React from 'react';

import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';

type ListPageProps = {
  title: string;
  children: React.ReactNode;
};

const ListPage: React.FC<ListPageProps> = ({ title, children }) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h1" size="3xl">
        {title}
      </Title>
      {children}
    </PageSection>
  );
};

export default ListPage;
