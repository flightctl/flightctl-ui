import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, WarningTriangleIcon } from '@patternfly/react-icons';

import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Repository } from '@types';

import StatusInfo from '@app/components/common/StatusInfo';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '@app/utils/status/repository';
import RepositoryResourceSyncList from '@app/components/ResourceSync/RepositoryResourceSyncList';

const RepositoryDetails = () => {
  const { repositoryId } = useParams() as { repositoryId: string };
  const [repoDetails, isLoading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${repositoryId}`,
  });

  if (error && !repoDetails) {
    return <div>Failed to retrieve repository details</div>;
  }
  if (isLoading || !repoDetails) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <PageSection>
      <Breadcrumb>
        <BreadcrumbItem to="/administration/repositories">Repositories</BreadcrumbItem>
        <BreadcrumbItem to="#" isActive>
          {repositoryId}
        </BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1" size="3xl">
        {repositoryId}
      </Title>
      <Grid hasGutter>
        <GridItem md={8}>
          <Card>
            <CardTitle>Details</CardTitle>
            <CardBody>
              <DescriptionList columnModifier={{ lg: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>Url</DescriptionListTerm>
                  <DescriptionListDescription>{repoDetails.spec.repo}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Status</DescriptionListTerm>
                  <DescriptionListDescription>
                    {' '}
                    <StatusInfo statusInfo={getRepositorySyncStatus(repoDetails)} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Last transition</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getRepositoryLastTransitionTime(repoDetails)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Username</DescriptionListTerm>
                  <DescriptionListDescription>{repoDetails.spec.username || '-'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Password</DescriptionListTerm>
                  <DescriptionListDescription>
                    {repoDetails.spec.password ? (
                      <>
                        <CheckCircleIcon /> Password is set
                      </>
                    ) : (
                      <>
                        <WarningTriangleIcon /> Password not set
                      </>
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={8}>
          <Card>
            <CardTitle>Resource syncs</CardTitle>
            <CardBody>
              <RepositoryResourceSyncList repositoryId={repositoryId} />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default RepositoryDetails;
