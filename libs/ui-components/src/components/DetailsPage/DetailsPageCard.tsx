import { Card, CardBody, CardBodyProps, CardProps, CardTitle, Divider } from '@patternfly/react-core';
import * as React from 'react';

import './DetailsPageCard.css';

const DetailsPageCard: React.FC<CardProps> = (props) => <Card className="fctl-details-page__card" {...props} />;

export const DetailsPageCardTitle = ({ title }: { title: string }) => (
  <CardTitle className="fctl-details-page__card-title">
    {title}
    <Divider component="div" />
  </CardTitle>
);

export const DetailsPageCardBody: React.FC<CardBodyProps> = (props) => (
  <CardBody className="fctl-details-page__card-body" {...props} />
);

export default DetailsPageCard;
