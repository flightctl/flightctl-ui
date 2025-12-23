import * as React from 'react';
import { Card, CardProps } from '@patternfly/react-core';

const DetailsPageCard: React.FC<CardProps> = (props) => <Card style={{ height: '100%' }} {...props} ref={undefined} />;

export default DetailsPageCard;
