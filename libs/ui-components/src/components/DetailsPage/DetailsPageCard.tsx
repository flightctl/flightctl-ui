import { Card, CardBody, CardBodyProps, CardProps } from '@patternfly/react-core';
import * as React from 'react';

import './DetailsPageCard.css';

const DetailsPageCard: React.FC<CardProps> = (props) => <Card className="fctl-details-page__card" {...props} />;

export const DetailsPageCardBody: React.FC<CardBodyProps> = (props) => (
  <CardBody className="fctl-details-page__card-body" {...props} />
);

export default DetailsPageCard;
