import * as React from 'react';
import { Card, CardBody, CardBodyProps, CardProps } from '@patternfly/react-core';

const DetailsPageCard: React.FC<CardProps> = (props) => <Card style={{ height: '100%' }} {...props} ref={undefined} />;

export const DetailsPageCardBody: React.FC<CardBodyProps> = (props) => <CardBody {...props} />;

export default DetailsPageCard;
