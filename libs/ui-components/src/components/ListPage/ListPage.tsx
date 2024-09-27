import * as React from 'react';

import { PageSection, PageSectionVariants, Title, TitleProps } from '@patternfly/react-core';

type ListPageProps = {
  title: string;
  headingLevel?: TitleProps['headingLevel'];
  children: React.ReactNode;
};

const ListPage: React.FC<ListPageProps> = ({ title, headingLevel = 'h1', children }) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel={headingLevel} size="3xl">
        {title}
      </Title>
      {children}
    </PageSection>
  );
};

export default ListPage;
