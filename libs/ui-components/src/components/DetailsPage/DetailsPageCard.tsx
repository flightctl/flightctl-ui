import * as React from 'react';
import { Card, type CardProps, CardTitle, Flex, FlexItem, Icon } from '@patternfly/react-core';

export const DetailsPageCardTitle = ({
  icon,
  title,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}) => (
  <CardTitle>
    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <Icon>{icon}</Icon>
      </FlexItem>
      <FlexItem>{title}</FlexItem>
      <FlexItem>{badge}</FlexItem>
    </Flex>
  </CardTitle>
);

const DetailsPageCard = (props: CardProps) => <Card isFullHeight {...props} ref={undefined} />;

export default DetailsPageCard;
