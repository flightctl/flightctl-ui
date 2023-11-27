import * as React from 'react';

import {
  BackgroundImage,
  Button,
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  Grid,
  GridItem,
  PageSection,
  Title,
} from '@patternfly/react-core';

const Overview: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Overview</Title>
    <img src="/images/mock-ui-fleet-status.png" alt="Mock Fleet Status" width="834" height="318" />
  </PageSection>
);

export { Overview };
