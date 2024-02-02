import React from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, PageSection, Title } from '@patternfly/react-core';
import { Fleet } from '@types';

import { useSingleFetch } from '@app/hooks/useSingleFetch';

import FleetDetailsContent from './FleetDetailsContent';

const FleetDetails = () => {
  // TODO use named parameter in Route
  const location = useLocation();
  const urlTokens = location.pathname.split('/');
  const fleetKey = urlTokens[urlTokens.length - 1];

  const [fleetDetails, isLoading, error] = useSingleFetch<Required<Fleet>>(`fleets/${fleetKey}`);

  if (error && !fleetDetails) {
    return <div>Failed to retrieve fleet details</div>;
  }
  if (isLoading || fleetDetails === undefined) {
    return <div>Loading...</div>;
  }

  // TODO handle case when there's an error after having loaded fleetDetails previously. Show alert?
  return (
    <PageSection>
      <Breadcrumb>
        <BreadcrumbItem to="/devicemanagement/fleets">Fleets</BreadcrumbItem>
        <BreadcrumbItem to="#" isActive>
          {fleetKey}
        </BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1" size="3xl">
        {fleetKey}
      </Title>

      <FleetDetailsContent fleet={fleetDetails} />
    </PageSection>
  );
};

export default FleetDetails;
