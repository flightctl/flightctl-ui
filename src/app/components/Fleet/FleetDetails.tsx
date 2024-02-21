import React from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Bullseye, PageSection, Spinner, Title } from '@patternfly/react-core';

import { Fleet } from '@types';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';

import FleetDetailsContent from './FleetDetailsContent';

const FleetDetails = () => {
  const { fleetId } = useParams();
  const [fleetDetails, isLoading, error] = useFetchPeriodically<Required<Fleet>>({ endpoint: `fleets/${fleetId}` });

  if (error && !fleetDetails) {
    return <div>Failed to retrieve fleet details</div>;
  }
  if (isLoading || fleetDetails === undefined) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  // TODO handle case when there's an error after having loaded fleetDetails previously. Show alert?
  return (
    <PageSection>
      <Breadcrumb>
        <BreadcrumbItem to="/devicemanagement/fleets">Fleets</BreadcrumbItem>
        <BreadcrumbItem to="#" isActive>
          {fleetId}
        </BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1" size="3xl">
        {fleetId}
      </Title>

      <FleetDetailsContent fleet={fleetDetails} />
    </PageSection>
  );
};

export default FleetDetails;
