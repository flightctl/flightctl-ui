import * as React from 'react';

import { Flex, FlexItem, PageSection, PageSectionVariants, Title, TitleProps } from '@patternfly/react-core';
import TechPreviewBadge from '../common/TechPreviewBadge';

type ListPageProps = {
  title: string;
  headingLevel?: TitleProps['headingLevel'];
  children: React.ReactNode;
  withBadge?: boolean;
};

const ListPage: React.FC<ListPageProps> = ({ title, headingLevel = 'h1', withBadge = true, children }) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <Title headingLevel={headingLevel} size="3xl">
            {title}
          </Title>
        </FlexItem>
        {withBadge && (
          <FlexItem>
            <TechPreviewBadge />
          </FlexItem>
        )}
      </Flex>
      {children}
    </PageSection>
  );
};

export default ListPage;
