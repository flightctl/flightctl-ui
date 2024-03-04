import React from 'react';
import { useParams } from 'react-router-dom';

import { Fleet } from '@types';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';

import FleetDetailsContent from './FleetDetailsContent';
import DetailsPage from '../DetailsPage/DetailsPage';

const FleetDetails = () => {
  const { fleetId } = useParams();
  const [fleetDetails, isLoading, error] = useFetchPeriodically<Required<Fleet>>({ endpoint: `fleets/${fleetId}` });

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      title={fleetId}
      resourceLink="/devicemanagement/fleets"
      resourceName="Fleets"
    >
      {fleetDetails && <FleetDetailsContent fleet={fleetDetails} />}
    </DetailsPage>
  );
};

export default FleetDetails;
