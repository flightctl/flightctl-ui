import * as React from 'react';
import { Card, CardBody, CardBodyProps, CardProps } from '@patternfly/react-core';

import './DetailsPageCard.css';

const DetailsPageCard: React.FC<CardProps> = ({ className, ...props }) => (
  <Card className={`fctl-details-page__card ${className || ''}`} {...props} ref={undefined} />
);

export const DetailsPageCardBody: React.FC<CardBodyProps> = (props) => (
  <CardBody className="fctl-details-page__card-body" {...props} />
);

export default DetailsPageCard;
